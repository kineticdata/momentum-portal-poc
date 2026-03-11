/**
 * Integrator Installer
 *
 * Replicates the Ruby tooling/integrator.rb install_connections behavior by reading
 * template/export/integrator/connections.json and creating connections + operations
 * via the Integrator API.
 *
 * Integrator API base: {server}/app/integrator/api
 */

import { readFile, access } from "fs/promises";
import path from "path";
import { createLogger } from "./api-client.mjs";

const logger = createLogger("[integrator] ");

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep merge two objects (simple recursive merge, similar to Ruby's deep_merge).
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Install connections and operations from connections.json.
 * Mirrors the Ruby install_connections function.
 */
async function installConnections(api, integratorPath) {
  const connectionsFile = path.join(integratorPath, "connections.json");
  if (!(await fileExists(connectionsFile))) {
    logger.info("No connections.json found, skipping.");
    return;
  }

  const connections = JSON.parse(await readFile(connectionsFile, "utf-8"));
  logger.info(`Installing connections (${connections.length})...`);

  for (const connection of connections) {
    // Separate operations from the connection object
    const operations = connection.operations || [];
    const connectionBody = { ...connection };
    delete connectionBody.operations;

    // Create the connection
    const connRes = await api.post("/connections", { body: connectionBody });
    if (!connRes.ok) {
      logger.error(
        `Failed to create connection "${connection.name}": ${connRes.status} ${JSON.stringify(connRes.data)}`,
      );
      continue;
    }

    const connectionId = connRes.data?.id;
    logger.info(`  Created connection: ${connection.name} (${connectionId})`);

    // Create operations for this connection
    for (const operation of operations) {
      const opRes = await api.post(`/connections/${connectionId}/operations`, {
        body: operation,
      });
      if (!opRes.ok) {
        logger.error(
          `  Failed to create operation "${operation.name}" for "${connection.name}": ${opRes.status} ${JSON.stringify(opRes.data)}`,
        );
      } else {
        logger.info(`    Created operation: ${operation.name}`);
      }
    }
  }
}

/**
 * Configure connection values with environment-specific credentials.
 * Mirrors the Ruby connection_configurations deep_merge behavior.
 */
async function configureConnections(api, connectionConfigurations) {
  const keys = Object.keys(connectionConfigurations);
  if (keys.length === 0) return;

  logger.info("Configuring connection credentials...");
  const { data } = await api.get("/connections");
  const connections = Array.isArray(data) ? data : data?.connections || [];

  for (const connection of connections) {
    const config = connectionConfigurations[connection.name];
    if (!config) continue;

    logger.info(`  Updating connection: ${connection.name}`);
    const merged = deepMerge(connection, config);
    const res = await api.put(`/connections/${connection.id}`, { body: merged });
    if (!res.ok) {
      logger.warn(
        `  Failed to update connection "${connection.name}": ${res.status} ${JSON.stringify(res.data)}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full Integrator import phase.
 *
 * Mirrors install.rb's integrator section:
 * 1. Install connections and operations from connections.json
 * 2. Configure connection values with environment-specific credentials
 */
export async function installIntegrator(api, { integratorPath, connectionConfigurations }) {
  logger.info("Starting integrator installation...");

  await installConnections(api, integratorPath);
  await configureConnections(api, connectionConfigurations);

  logger.info("Integrator installation complete.");
}
