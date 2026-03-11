/**
 * Task Installer
 *
 * Replicates the Ruby SDK's task import behavior by reading the template/export/task
 * directory and making REST API calls to the Task API v2.
 *
 * Task API v2 base: {proxyUrl}/task/app/api/v2
 */

import { readFile, readdir, access } from "fs/promises";
import path from "path";
import { createLogger } from "./api-client.mjs";

const logger = createLogger("[task] ");

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf-8"));
}

async function listFiles(dirPath, ext) {
  if (!(await fileExists(dirPath))) return [];
  const entries = await readdir(dirPath);
  return entries.filter((f) => f.endsWith(ext)).map((f) => path.join(dirPath, f));
}

async function listDirs(dirPath) {
  if (!(await fileExists(dirPath))) return [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => path.join(dirPath, e.name));
}

// ---------------------------------------------------------------------------
// Task import phases
// ---------------------------------------------------------------------------

/**
 * Delete playground data (categories, groups, users, policy rules).
 */
async function cleanupPlayground(api) {
  logger.info("Cleaning up playground data...");

  // Delete categories
  const catRes = await api.get("/categories");
  for (const cat of catRes.data?.categories || []) {
    await api.delete(`/categories/${encodeURIComponent(cat.name)}`);
  }

  // Delete groups
  const groupRes = await api.get("/groups");
  for (const group of groupRes.data?.groups || []) {
    await api.delete(`/groups/${encodeURIComponent(group.name)}`);
  }

  // Delete users
  const userRes = await api.get("/users");
  for (const user of userRes.data?.users || []) {
    await api.delete(`/users/${encodeURIComponent(user.username)}`);
  }

  // Delete policy rules by type
  for (const type of ["API Access", "Console Access", "Category Access", "System Default"]) {
    const prRes = await api.get(`/policyRules/${encodeURIComponent(type)}`);
    for (const rule of prRes.data?.policyRules || []) {
      await api.delete(
        `/policyRules/${encodeURIComponent(type)}/${encodeURIComponent(rule.name)}`,
      );
    }
  }
}

/**
 * Import access keys from JSON files.
 */
async function importAccessKeys(api, taskPath) {
  const keysDir = path.join(taskPath, "access-keys");
  const files = await listFiles(keysDir, ".json");
  if (files.length === 0) return;

  logger.info(`Importing access keys (${files.length})...`);
  for (const file of files) {
    const accessKey = await readJson(file);
    // Check if already installed
    const existing = await api.get(`/access-keys/${encodeURIComponent(accessKey.identifier)}`);
    accessKey.secret = "SETME";

    if (existing.status === 404) {
      await api.post("/access-keys", { body: accessKey });
    } else {
      await api.put(`/access-keys/${encodeURIComponent(accessKey.identifier)}`, {
        body: accessKey,
      });
    }
    logger.info(`  Imported access key: ${accessKey.identifier}`);
  }
}

/**
 * Import groups from JSON files.
 */
async function importGroups(api, taskPath) {
  const groupsDir = path.join(taskPath, "groups");
  const files = await listFiles(groupsDir, ".json");
  if (files.length === 0) return;

  logger.info(`Importing groups (${files.length})...`);
  for (const file of files) {
    const group = await readJson(file);
    await api.post("/groups", { body: group });
  }
}

/**
 * Import handlers from ZIP files.
 * force=true replaces existing handlers.
 */
async function importHandlers(api, taskPath, force = true) {
  const handlersDir = path.join(taskPath, "handlers");
  const files = await listFiles(handlersDir, ".zip");
  if (files.length === 0) return;

  logger.info(`Importing handlers (${files.length})...`);
  for (const file of files) {
    const fileName = path.basename(file);
    const res = await api.uploadFile(`/handlers${force ? "?force=true" : ""}`, file, "package");
    if (!res.ok) {
      logger.warn(`  Failed to import handler "${fileName}": ${res.status} ${JSON.stringify(res.data)}`);
    } else {
      logger.info(`  Imported handler: ${fileName}`);
    }
  }
}

/**
 * Import policy rules from JSON files.
 */
async function importPolicyRules(api, taskPath) {
  const rulesDir = path.join(taskPath, "policyRules");
  const files = await listFiles(rulesDir, ".json");
  if (files.length === 0) return;

  logger.info(`Importing policy rules (${files.length})...`);
  for (const file of files) {
    const rule = await readJson(file);
    const res = await api.post(`/policyRules/${encodeURIComponent(rule.type)}`, { body: rule });
    if (!res.ok) {
      logger.warn(`  Failed to create policy rule "${rule.name}": ${res.status}`);
    } else {
      logger.info(`  Imported policy rule: ${rule.name}`);
    }
  }
}

/**
 * Import sources from JSON files with environment-specific properties.
 */
async function importSources(api, taskPath, sourceProperties) {
  const sourcesDir = path.join(taskPath, "sources");
  const files = await listFiles(sourcesDir, ".json");
  if (files.length === 0) return;

  logger.info(`Importing sources (${files.length})...`);
  for (const file of files) {
    const source = await readJson(file);
    // Apply environment-specific properties
    source.properties = sourceProperties[source.name] || source.properties || {};

    const existing = await api.get(`/sources/${encodeURIComponent(source.name)}`);
    if (existing.status === 404) {
      const res = await api.post("/sources", { body: source });
      if (!res.ok) {
        logger.warn(`  Failed to create source "${source.name}": ${res.status} ${JSON.stringify(res.data)}`);
      }
    } else {
      await api.put(`/sources/${encodeURIComponent(source.name)}`, { body: source });
    }
    logger.info(`  Imported source: ${source.name}`);
  }
}

/**
 * Configure handler info values (SMTP, API credentials, etc.).
 */
async function configureHandlers(api, handlerConfigurations) {
  logger.info("Configuring handler info values...");
  const { data } = await api.get("/handlers", { query: { limit: "1000" } });
  const handlers = data?.handlers || [];

  for (const handler of handlers) {
    const defId = handler.definitionId;
    if (handlerConfigurations[defId]) {
      logger.info(`  Updating handler: ${defId}`);
      await api.put(`/handlers/${encodeURIComponent(defId)}`, {
        body: { properties: handlerConfigurations[defId] },
      });
    } else if (defId.startsWith("smtp_email_send") && handlerConfigurations["smtp_email_send"]) {
      logger.info(`  Updating SMTP handler: ${defId}`);
      await api.put(`/handlers/${encodeURIComponent(defId)}`, {
        body: { properties: handlerConfigurations["smtp_email_send"] },
      });
    }
  }
}

/**
 * Import routines from XML files.
 */
async function importRoutines(api, taskPath, force = true) {
  const routinesDir = path.join(taskPath, "routines");
  const files = await listFiles(routinesDir, ".xml");
  if (files.length === 0) return;

  logger.info(`Importing routines (${files.length})...`);
  for (const file of files) {
    const fileName = path.basename(file);
    const uploadRes = await api.uploadFile(`/trees${force ? "?force=true" : ""}`, file, "content");
    if (!uploadRes.ok) {
      logger.warn(`  Failed to import routine "${fileName}": ${uploadRes.status} ${JSON.stringify(uploadRes.data)}`);
    } else {
      logger.info(`  Imported routine: ${fileName}`);
    }
  }
}

/**
 * Import categories from JSON files.
 */
async function importCategories(api, taskPath) {
  const categoriesDir = path.join(taskPath, "categories");
  const files = await listFiles(categoriesDir, ".json");
  if (files.length === 0) return;

  logger.info(`Importing categories (${files.length})...`);
  for (const file of files) {
    const category = await readJson(file);
    const res = await api.post("/categories", { body: category });
    if (!res.ok) {
      logger.warn(`  Failed to create category "${category.name}": ${res.status}`);
    } else {
      logger.info(`  Imported category: ${category.name}`);
    }
  }
}

/**
 * Import trees (workflows) from XML files within source directories.
 */
async function importTrees(api, taskPath, force) {
  const sourcesDir = path.join(taskPath, "sources");
  if (!(await fileExists(sourcesDir))) return;

  const sourceDirs = await listDirs(sourcesDir);
  for (const sourceDir of sourceDirs) {
    const treesDir = path.join(sourceDir, "trees");
    const files = await listFiles(treesDir, ".xml");
    if (files.length === 0) continue;

    const sourceName = path.basename(sourceDir);
    logger.info(`Importing trees for source "${sourceName}" (${files.length})...`);
    for (const file of files) {
      const fileName = path.basename(file);
      const res = await api.uploadFile(`/trees${force ? "?force=true" : ""}`, file, "content");
      if (!res.ok) {
        logger.warn(`  Failed to import tree "${fileName}": ${res.status} ${JSON.stringify(res.data)}`);
      } else {
        logger.info(`  Imported tree: ${fileName}`);
      }
    }
  }
}

/**
 * Update Task engine configuration.
 */
async function updateEngine(api, config) {
  logger.info("Updating engine configuration...");
  await api.put("/config/engine", { body: config });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full Task import phase.
 *
 * Mirrors install.rb's task section:
 * 1. Cleanup playground data
 * 2. Import access keys
 * 3. Import groups, handlers, policy rules
 * 4. Import sources with environment-specific properties
 * 5. Configure handler info values
 * 6. Update engine properties
 * 7. Import routines, categories, trees
 */
export async function installTask(
  api,
  { taskPath, sourceProperties, handlerConfigurations, engineConfig },
) {
  logger.info("Starting task installation...");

  // Phase 1: Cleanup
  await cleanupPlayground(api);

  // Phase 2: Import access keys
  await importAccessKeys(api, taskPath);

  // Phase 3: Import groups, handlers, policy rules (order matters)
  await importGroups(api, taskPath);
  await importHandlers(api, taskPath, true);
  await importPolicyRules(api, taskPath);

  // Phase 4: Import sources
  await importSources(api, taskPath, sourceProperties);

  // Phase 5: Configure handler info values
  await configureHandlers(api, handlerConfigurations);

  // Phase 6: Update engine
  await updateEngine(api, engineConfig);

  // Phase 7: Import routines, categories, trees (order matters)
  await importRoutines(api, taskPath, true);
  await importCategories(api, taskPath);
  await importTrees(api, taskPath, true);

  logger.info("Task installation complete.");
}
