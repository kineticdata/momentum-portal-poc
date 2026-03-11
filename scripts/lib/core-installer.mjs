/**
 * Core Installer
 *
 * Replicates the Ruby SDK's import_space behavior by reading the template/export/core
 * directory and making REST API calls to provision the space.
 *
 * Core API v1 base: {server}/app/api/v1
 */

import { readFile, readdir, access } from "fs/promises";
import path from "path";
import { createLogger } from "./api-client.mjs";

const logger = createLogger("[core] ");

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function readJsonIfExists(filePath) {
  if (await fileExists(filePath)) return readJson(filePath);
  return null;
}

async function listJsonFiles(dirPath) {
  if (!(await fileExists(dirPath))) return [];
  const entries = await readdir(dirPath);
  return entries.filter((f) => f.endsWith(".json")).map((f) => path.join(dirPath, f));
}

async function listDirs(dirPath) {
  if (!(await fileExists(dirPath))) return [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => path.join(dirPath, e.name));
}

// ---------------------------------------------------------------------------
// Core import phases
// ---------------------------------------------------------------------------

/**
 * Delete all existing kapps (cleanup pre-created artifacts).
 */
async function cleanupKapps(api) {
  logger.info("Cleaning up pre-created kapps...");
  const { data } = await api.get("/kapps");
  const kapps = data?.kapps || [];
  for (const kapp of kapps) {
    logger.info(`  Deleting kapp: ${kapp.slug}`);
    await api.delete(`/kapps/${kapp.slug}`);
  }
}

/**
 * Delete all space-level security policy definitions.
 */
async function cleanupSecurityPolicyDefinitions(api) {
  logger.info("Cleaning up space security policy definitions...");
  const { data } = await api.get("/securityPolicyDefinitions");
  const defs = data?.securityPolicyDefinitions || [];
  for (const def of defs) {
    await api.delete(`/securityPolicyDefinitions/${encodeURIComponent(def.name)}`);
  }
}

/**
 * Import attribute definitions from JSON files.
 */
async function importAttributeDefinitions(api, spacePath) {
  const defTypes = [
    { file: "spaceAttributeDefinitions.json", endpoint: "/spaceAttributeDefinitions" },
    { file: "userAttributeDefinitions.json", endpoint: "/userAttributeDefinitions" },
    {
      file: "userProfileAttributeDefinitions.json",
      endpoint: "/userProfileAttributeDefinitions",
    },
    { file: "teamAttributeDefinitions.json", endpoint: "/teamAttributeDefinitions" },
  ];

  for (const { file, endpoint } of defTypes) {
    const filePath = path.join(spacePath, file);
    const defs = await readJsonIfExists(filePath);
    if (!defs) continue;

    // Fetch existing definitions to avoid duplicate errors
    const { data: existingData } = await api.get(endpoint);
    const existingKey = Object.keys(existingData || {}).find((k) => Array.isArray(existingData[k]));
    const existingNames = new Set(
      (existingKey ? existingData[existingKey] : []).map((d) => d.name),
    );

    const toCreate = defs.filter((d) => !existingNames.has(d.name));
    logger.info(`Importing ${file} (${toCreate.length} new of ${defs.length} definitions)...`);
    for (const def of toCreate) {
      const res = await api.post(endpoint, { body: def });
      if (!res.ok) {
        logger.warn(`  Failed to create ${def.name}: ${res.status} ${JSON.stringify(res.data)}`);
      }
    }
  }
}

/**
 * Import space-level security policy definitions.
 */
async function importSpaceSecurityPolicies(api, spacePath) {
  const filePath = path.join(spacePath, "securityPolicyDefinitions.json");
  const defs = await readJsonIfExists(filePath);
  if (!defs) return;

  logger.info(`Importing space security policy definitions (${defs.length})...`);
  for (const def of defs) {
    const res = await api.post("/securityPolicyDefinitions", { body: def });
    if (!res.ok) {
      logger.warn(`  Failed to create SPD "${def.name}": ${res.status}`);
    }
  }
}

/**
 * Import teams from JSON files.
 */
async function importTeams(api, spacePath) {
  const teamsDir = path.join(spacePath, "teams");
  const files = await listJsonFiles(teamsDir);
  if (files.length === 0) return;

  logger.info(`Importing teams (${files.length})...`);
  for (const file of files) {
    const team = await readJson(file);
    const res = await api.post("/teams", { body: team });
    if (!res.ok) {
      logger.warn(`  Failed to create team "${team.name}": ${res.status} ${JSON.stringify(res.data)}`);
    } else {
      logger.info(`  Created team: ${team.name}`);
    }
  }
}

/**
 * Import bridge models.
 */
async function importModels(api, spacePath) {
  const modelsDir = path.join(spacePath, "models");
  const files = await listJsonFiles(modelsDir);
  if (files.length === 0) return;

  logger.info(`Importing bridge models (${files.length})...`);
  for (const file of files) {
    const model = await readJson(file);
    const res = await api.post("/models", { body: model });
    if (!res.ok) {
      logger.warn(`  Failed to create model "${model.name}": ${res.status}`);
    }
  }
}

/**
 * Import a single kapp and all its contents (forms, categories, security, attributes).
 */
async function importKapp(api, kappJsonPath, kappDirPath) {
  const kapp = await readJson(kappJsonPath);
  const kappSlug = path.basename(kappJsonPath, ".json");

  logger.info(`Creating kapp: ${kapp.name} (${kappSlug})...`);
  const res = await api.post("/kapps", { body: { ...kapp, slug: kappSlug } });
  if (!res.ok) {
    logger.error(`  Failed to create kapp "${kappSlug}": ${res.status} ${JSON.stringify(res.data)}`);
    return;
  }

  // If there's no kapp subdirectory, we're done
  if (!(await fileExists(kappDirPath))) return;

  // Import kapp-level attribute definitions
  const kappAttrTypes = [
    { file: "kappAttributeDefinitions.json", endpoint: `/kapps/${kappSlug}/kappAttributeDefinitions` },
    { file: "formAttributeDefinitions.json", endpoint: `/kapps/${kappSlug}/formAttributeDefinitions` },
    {
      file: "categoryAttributeDefinitions.json",
      endpoint: `/kapps/${kappSlug}/categoryAttributeDefinitions`,
    },
  ];

  for (const { file, endpoint } of kappAttrTypes) {
    const defs = await readJsonIfExists(path.join(kappDirPath, file));
    if (!defs) continue;
    logger.info(`  Importing ${file} for ${kappSlug} (${defs.length})...`);
    for (const def of defs) {
      const r = await api.post(endpoint, { body: def });
      if (!r.ok) {
        logger.warn(`    Failed: ${def.name} - ${r.status}`);
      }
    }
  }

  // Import form types
  const formTypes = await readJsonIfExists(path.join(kappDirPath, "formTypes.json"));
  if (formTypes) {
    logger.info(`  Importing form types for ${kappSlug} (${formTypes.length})...`);
    for (const ft of formTypes) {
      await api.post(`/kapps/${kappSlug}/formTypes`, { body: ft });
    }
  }

  // Import kapp-level security policy definitions
  const kappSpds = await readJsonIfExists(path.join(kappDirPath, "securityPolicyDefinitions.json"));
  if (kappSpds) {
    logger.info(`  Importing security policy definitions for ${kappSlug} (${kappSpds.length})...`);
    for (const spd of kappSpds) {
      await api.post(`/kapps/${kappSlug}/securityPolicyDefinitions`, { body: spd });
    }
  }

  // Import categories
  const categories = await readJsonIfExists(path.join(kappDirPath, "categories.json"));
  if (categories) {
    logger.info(`  Importing categories for ${kappSlug} (${categories.length})...`);
    for (const cat of categories) {
      await api.post(`/kapps/${kappSlug}/categories`, { body: cat });
    }
  }

  // Import forms
  const formsDir = path.join(kappDirPath, "forms");
  const formFiles = await listJsonFiles(formsDir);
  logger.info(`  Importing forms for ${kappSlug} (${formFiles.length})...`);
  for (const formFile of formFiles) {
    const form = await readJson(formFile);
    const formSlug = path.basename(formFile, ".json");

    const r = await api.post(`/kapps/${kappSlug}/forms`, { body: { ...form, slug: formSlug } });
    if (!r.ok) {
      logger.warn(`    Failed to create form "${formSlug}": ${r.status} ${JSON.stringify(r.data)}`);
    } else {
      logger.info(`    Created form: ${formSlug}`);
    }
  }
}

/**
 * Import kapps from the kapps directory.
 */
async function importKapps(api, spacePath) {
  const kappsDir = path.join(spacePath, "kapps");
  if (!(await fileExists(kappsDir))) return;

  const entries = await readdir(kappsDir, { withFileTypes: true });
  // Find JSON files (kapp definitions) — each may have a corresponding directory
  const kappJsonFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".json"));

  for (const entry of kappJsonFiles) {
    const kappSlug = path.basename(entry.name, ".json");
    const kappJsonPath = path.join(kappsDir, entry.name);
    const kappDirPath = path.join(kappsDir, kappSlug);
    await importKapp(api, kappJsonPath, kappDirPath);
  }
}

/**
 * Import Core API workflows (space-level and form-level).
 *
 * Directory structure:
 *   space/workflows/{event}/{name}.json     — space-level workflows
 *   space/kapps/{kapp}/forms/{form}/workflows/{event}/{name}.json — form-level
 */
async function importWorkflows(api, corePath) {
  // Space-level workflows
  const spaceWorkflowsDir = path.join(corePath, "space", "workflows");
  await importWorkflowsFromDir(api, spaceWorkflowsDir, (event, workflow) => ({
    method: "POST",
    url: "/workflows",
    body: { ...workflow, event: formatEvent(event) },
  }));

  // Form-level workflows (iterate kapps and forms)
  const kappsDir = path.join(corePath, "space", "kapps");
  if (!(await fileExists(kappsDir))) return;

  const kappDirs = await listDirs(kappsDir);
  for (const kappDir of kappDirs) {
    const kappSlug = path.basename(kappDir);
    const formsDir = path.join(kappDir, "forms");
    if (!(await fileExists(formsDir))) continue;

    const formDirs = await listDirs(formsDir);
    for (const formDir of formDirs) {
      const formSlug = path.basename(formDir);
      const workflowsDir = path.join(formDir, "workflows");
      await importWorkflowsFromDir(api, workflowsDir, (event, workflow) => ({
        method: "POST",
        url: `/kapps/${kappSlug}/forms/${formSlug}/workflows`,
        body: { ...workflow, event: formatEvent(event) },
      }));
    }
  }
}

/**
 * Import workflows from a workflows directory containing event subdirectories.
 */
async function importWorkflowsFromDir(api, workflowsDir, buildRequest) {
  if (!(await fileExists(workflowsDir))) return;

  const eventDirs = await listDirs(workflowsDir);
  for (const eventDir of eventDirs) {
    const event = path.basename(eventDir);
    const files = await listJsonFiles(eventDir);
    for (const file of files) {
      const workflow = await readJson(file);
      const { method, url, body } = buildRequest(event, workflow);
      logger.info(`  Importing workflow: ${path.basename(file, ".json")} (${event})`);

      // Step 1: Create the workflow record
      const createBody = {
        name: body.name,
        event: body.event,
        type: "Tree",
        status: "Active",
      };
      const createRes = await api.post(url, { body: createBody });
      if (!createRes.ok) {
        logger.warn(`    Failed to create workflow: ${createRes.status} ${JSON.stringify(createRes.data)}`);
        continue;
      }

      // Step 2: Upload the tree definition
      const workflowId = createRes.data?.workflow?.id;
      if (workflowId && body.treeJson) {
        const uploadRes = await api.put(`${url}/${workflowId}`, {
          body: { treeJson: body.treeJson },
        });
        if (!uploadRes.ok) {
          logger.warn(`    Failed to upload tree definition: ${uploadRes.status}`);
        }
      }
    }
  }
}

/**
 * Convert directory name to event name.
 * e.g. "submission-submitted" → "Submission Submitted"
 */
function formatEvent(dirName) {
  return dirName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full Core import phase.
 *
 * Mirrors install.rb's core section:
 * 1. Cleanup pre-created kapps and security policies
 * 2. Import space configuration (attribute defs, security, teams, kapps, forms)
 * 3. Update space attributes
 * 4. Create additional users
 * 5. Import workflows
 */
export async function installCore(api, { corePath, vars }) {
  logger.info("Starting core installation...");

  const spacePath = path.join(corePath, "space");

  // Phase 1: Cleanup
  await cleanupKapps(api);
  await cleanupSecurityPolicyDefinitions(api);

  // Phase 2: Import space configuration
  // Import attribute definitions and security policy definitions FIRST —
  // space.json references security policies by name, so their definitions
  // must exist before the space update applies them.
  await importAttributeDefinitions(api, spacePath);
  await importSpaceSecurityPolicies(api, spacePath);

  // Now update space from space.json (applies security policies, display settings, etc.)
  const spaceJson = await readJsonIfExists(path.join(corePath, "space.json"));
  if (spaceJson) {
    logger.info("Updating space from space.json...");
    await api.put("/space", { body: spaceJson });
  }

  await importTeams(api, spacePath);
  await importModels(api, spacePath);
  await importKapps(api, spacePath);

  // Phase 3: Update space attributes (environment-specific)
  const spaceAttributesMap = {
    "Web Server Url": [vars.core.server],
  };
  // Merge in any space attributes from vars.data.space.attributesMap
  const varsSpaceAttrs = vars.data?.space?.attributesMap || {};
  Object.assign(spaceAttributesMap, varsSpaceAttrs);

  logger.info("Updating space attributes...");
  await api.put("/space", {
    body: {
      attributesMap: spaceAttributesMap,
      name: vars.core.space_name,
    },
  });

  // Phase 4: Create additional users
  const users = vars.data?.users || [];
  if (users.length > 0) {
    logger.info(`Creating ${users.length} additional user(s)...`);
    for (const user of users) {
      const res = await api.post("/users", { body: user });
      if (!res.ok) {
        logger.warn(`  Failed to create user "${user.username}": ${res.status}`);
      }
    }
  }

  // Phase 5: Import workflows
  logger.info("Importing Core API workflows...");
  await importWorkflows(api, corePath);

  logger.info("Core installation complete.");
}
