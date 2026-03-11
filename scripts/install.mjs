#!/usr/bin/env node

/**
 * Kinetic Platform Template Installer (JavaScript)
 *
 * This script provisions a Kinetic Platform space with template artifacts from
 * the template/export directory. It is the JS equivalent of install.rb.
 *
 * The environment must already exist — this script installs the template
 * configuration (kapps, forms, workflows, handlers, connections, etc.) into it.
 *
 * Usage:
 *   node scripts/install.mjs                         # uses scripts/install.config.json
 *   node scripts/install.mjs path/to/config.json     # uses specified config file
 *
 * Configuration:
 *   Copy scripts/install.config.example.json to scripts/install.config.json
 *   and fill in your environment-specific values. Only a few fields are required:
 *
 *     space_slug  — the slug of the target space (e.g. "my-project")
 *     domain      — the hosting domain (e.g. "kinops.io")
 *     space_name  — the display name for the space
 *     username    — space admin username
 *     password    — space admin password
 *
 *   All API URLs are derived automatically from space_slug + domain.
 *
 * This script is intended to be modified per-project depending on the use case.
 * Add or remove phases, change configurations, or add seed data as needed.
 */

import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createApiClient, createOAuthApiClient, createLogger } from "./lib/api-client.mjs";
import { installCore } from "./lib/core-installer.mjs";
import { installTask } from "./lib/task-installer.mjs";
import { installIntegrator } from "./lib/integrator-installer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger();

const TEMPLATE_NAME = "momentum-portal";

// ---------------------------------------------------------------------------
// Load and resolve configuration
// ---------------------------------------------------------------------------

async function loadConfig() {
  const configPath = process.argv[2] || path.join(__dirname, "install.config.json");
  let raw;
  try {
    raw = await readFile(configPath, "utf-8");
  } catch (err) {
    logger.error(`Failed to load config from ${configPath}: ${err.message}`);
    logger.error(
      "Copy scripts/install.config.example.json to scripts/install.config.json and configure it.",
    );
    process.exit(1);
  }
  return JSON.parse(raw);
}

/**
 * Derive the full internal vars object from the simple user config.
 * This keeps the config file minimal while giving every installer what it needs.
 */
function resolveVars(config) {
  const { space_slug, domain, space_name, username, password } = config;

  if (!space_slug || !domain || !username || !password) {
    logger.error("Config must include: space_slug, domain, username, password");
    process.exit(1);
  }

  const server = `https://${space_slug}.${domain}`;

  return {
    core: {
      server,
      api: `${server}/app/api/v1`,
      proxy_url: `${server}/app/components`,
      space_slug,
      space_name: space_name || space_slug,
      service_user_username: username,
      service_user_password: password,
    },
    data: {
      requesting_user: {
        username,
        displayName: space_name || username,
        email: username,
      },
      users: config.users || [],
      space: {
        attributesMap: {
          "Platform Host URL": [server],
        },
      },
      smtp: config.smtp || {},
      handlers: config.handlers || {},
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const config = await loadConfig();
  const vars = resolveVars(config);

  // Determine directory paths
  const projectRoot = path.resolve(__dirname, "..");
  const exportPath = path.join(projectRoot, "template", "export");
  const corePath = path.join(exportPath, "core");
  const taskPath = path.join(exportPath, "task");
  const integratorPath = path.join(exportPath, "integrator");

  logger.info(`Installing the "${TEMPLATE_NAME}" template.`);
  logger.info(`  Server: ${vars.core.server}`);
  logger.info(`  Space:  ${vars.core.space_slug}`);

  // --------------------------------------------------------------------------
  // common configurations (mirrors install.rb)
  // --------------------------------------------------------------------------

  // Task source properties — environment-specific connection info for workflow sources
  const sourceProperties = {
    "Kinetic Request CE": {
      "Space Slug": null,
      "Web Server": vars.core.server,
      "Proxy Username": vars.core.service_user_username,
      "Proxy Password": vars.core.service_user_password,
    },
  };

  // SMTP configuration
  const smtp = vars.data.smtp;
  if (smtp.server) {
    const logSmtp = { ...smtp, password: "************" };
    logger.info(`SMTP config: ${JSON.stringify(logSmtp)}`);
  } else {
    logger.info("No SMTP configuration provided.");
  }

  // Task handler info values — credentials for handlers
  const handlerConfigurations = {
    smtp_email_send: {
      server: smtp.server || smtp.host || "mysmtp.com",
      port: String(smtp.port || "25"),
      tls: String(smtp.tls || smtp.tlsEnabled || "true"),
      username: smtp.username || "joe.blow",
      password: smtp.password || "password",
    },
    kinetic_core_system_api_v1: {
      api_username: vars.core.service_user_username,
      api_password: vars.core.service_user_password,
      api_location: vars.core.api,
    },
    // Merge in any additional handler configs from config
    ...vars.data.handlers,
  };

  // Integrator connection configurations — environment-specific credentials
  const connectionConfigurations = {
    "Kinetic Platform": {
      config: {
        baseUrl: vars.core.api,
        auth: {
          username: vars.core.service_user_username,
          password: vars.core.service_user_password,
        },
      },
    },
    // Add project-specific connection overrides here. Example:
    // "Service Now": {
    //   config: {
    //     baseUrl: "https://instance.service-now.com",
    //     auth: { username: "admin", password: "secret" },
    //   },
    // },
  };

  // Task engine configuration
  const engineConfig = {
    "Max Threads": "5",
    "Sleep Delay": "1",
    "Trigger Query": "'Selection Criterion'=null",
  };

  // --------------------------------------------------------------------------
  // Phase 1: Core (Space, Kapps, Forms, Teams)
  // --------------------------------------------------------------------------

  const coreApi = createApiClient({
    baseUrl: vars.core.api,
    username: vars.core.service_user_username,
    password: vars.core.service_user_password,
  });

  logger.info("--- Phase 1: Core ---");
  await installCore(coreApi, { corePath, vars });

  // --------------------------------------------------------------------------
  // Phase 2: Task (Handlers, Sources, Routines, Trees)
  // --------------------------------------------------------------------------

  const taskApi = createApiClient({
    baseUrl: `${vars.core.proxy_url}/task/app/api/v2`,
    username: vars.core.service_user_username,
    password: vars.core.service_user_password,
  });

  logger.info("--- Phase 2: Task ---");
  await installTask(taskApi, {
    taskPath,
    sourceProperties,
    handlerConfigurations,
    engineConfig,
  });

  // --------------------------------------------------------------------------
  // Phase 3: Integrator (Connections, Operations)
  // --------------------------------------------------------------------------

  const integratorApi = createOAuthApiClient({
    baseUrl: `${vars.core.server}/app/integrator/api`,
    server: vars.core.server,
    username: vars.core.service_user_username,
    password: vars.core.service_user_password,
  });

  logger.info("--- Phase 3: Integrator ---");
  await installIntegrator(integratorApi, {
    integratorPath,
    connectionConfigurations,
  });

  // --------------------------------------------------------------------------
  // Phase 4: Template-specific (Users, Seed Data)
  // --------------------------------------------------------------------------

  logger.info("--- Phase 4: Template-specific ---");

  // Create requesting user as a space admin
  const reqUser = vars.data.requesting_user;
  if (reqUser) {
    logger.info(`Creating requesting user: ${reqUser.username}`);
    const res = await coreApi.post("/users", {
      body: {
        username: reqUser.username,
        email: reqUser.email,
        displayName: reqUser.displayName,
        password: generateRandomPassword(16),
        enabled: true,
        spaceAdmin: true,
        memberships: [],
        profileAttributesMap: {},
      },
    });
    if (!res.ok) {
      logger.warn(
        `  Failed to create user "${reqUser.username}": ${res.status} ${JSON.stringify(res.data)}`,
      );
    }
  }

  // --------------------------------------------------------------------------
  // Add project-specific installation steps below.
  // Examples:
  //   - Seed form submissions (reference data, config records)
  //   - Create additional teams or team memberships
  //   - Set form attributes programmatically
  //   - Build form indexes
  // --------------------------------------------------------------------------

  logger.info(`Finished installing the "${TEMPLATE_NAME}" template.`);
}

/**
 * Generate a random password string.
 */
function generateRandomPassword(length) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run
main().catch((err) => {
  logger.error(`Installation failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
