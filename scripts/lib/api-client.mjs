/**
 * Kinetic Platform API Client
 *
 * Provides HTTP helpers with Basic Auth for the Core and Task APIs,
 * and OAuth bearer token auth for the Integrator API.
 * Uses native fetch (Node 18+).
 */

import { readFile } from "fs/promises";
import path from "path";

export function createLogger(prefix = "") {
  const ts = () => new Date().toISOString();
  return {
    info: (msg) => console.error(`[${ts()}] INFO: ${prefix}${msg}`),
    warn: (msg) => console.error(`[${ts()}] WARN: ${prefix}${msg}`),
    error: (msg) => console.error(`[${ts()}] ERROR: ${prefix}${msg}`),
  };
}

/**
 * Creates an API client for a Kinetic API endpoint using Basic Auth.
 *
 * @param {object} options
 * @param {string} options.baseUrl - Base URL for API requests
 * @param {string} options.username - Basic Auth username
 * @param {string} options.password - Basic Auth password
 */
export function createApiClient({ baseUrl, username, password }) {
  const authHeader =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  return buildClient(baseUrl, () => authHeader);
}

/**
 * Creates an API client for the Integrator API using OAuth bearer tokens.
 *
 * Uses the implicit grant flow with Basic Auth:
 *   GET /app/oauth/authorize?grant_type=implicit&response_type=token&client_id=system
 *   Authorization: Basic <user:pass>
 *   → 303 redirect with access_token in the fragment
 *
 * @param {object} options
 * @param {string} options.baseUrl - Integrator API base URL
 * @param {string} options.server - Platform server URL (for authorize endpoint)
 * @param {string} options.username - Resource owner username
 * @param {string} options.password - Resource owner password
 */
export function createOAuthApiClient({
  baseUrl,
  server,
  username,
  password,
}) {
  let cachedToken = null;
  let tokenExpiry = 0;

  async function getToken() {
    // Reuse token if still valid (with 30s buffer)
    if (cachedToken && Date.now() < tokenExpiry - 30000) {
      return cachedToken;
    }

    const userAuth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    // Implicit grant: Basic Auth + authorize → 303 with access_token in fragment
    const authorizeUrl = `${server}/app/oauth/authorize?grant_type=implicit&response_type=token&client_id=system`;
    const res = await fetch(authorizeUrl, {
      headers: { Authorization: userAuth },
      redirect: "manual",
    });

    if (res.status === 401) {
      const text = await res.text();
      throw new Error(`OAuth authorize failed (401): ${text}`);
    }

    if (res.status !== 302 && res.status !== 303) {
      const text = await res.text();
      throw new Error(`OAuth authorize unexpected status (${res.status}): ${text}`);
    }

    const location = res.headers.get("location");
    if (!location) {
      throw new Error("OAuth authorize response missing Location header");
    }

    const tokenMatch = location.match(/access_token=([^&#]+)/);
    if (!tokenMatch) {
      throw new Error(`OAuth redirect has no access_token: ${location.slice(0, 200)}`);
    }

    cachedToken = tokenMatch[1];
    // Extract expires_in from fragment if present; default to 12 hours
    const expiresMatch = location.match(/expires_in=(\d+)/);
    const expiresIn = expiresMatch ? parseInt(expiresMatch[1], 10) : 43200;
    tokenExpiry = Date.now() + expiresIn * 1000;
    return cachedToken;
  }

  return buildClient(baseUrl, async () => {
    const token = await getToken();
    return `Bearer ${token}`;
  });
}

/**
 * Internal: builds a client with a pluggable auth header provider.
 */
function buildClient(baseUrl, getAuthHeader) {
  async function request(method, urlPath, { body, query, headers = {} } = {}) {
    let url = `${baseUrl}${urlPath}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params}`;
    }

    const authHeader = await getAuthHeader();

    const opts = {
      method,
      headers: {
        Authorization: authHeader,
        ...headers,
      },
    };

    if (body !== undefined && !(body instanceof FormData)) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = typeof body === "string" ? body : JSON.stringify(body);
    } else if (body instanceof FormData) {
      opts.body = body;
    }

    const res = await fetch(url, opts);
    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return { status: res.status, ok: res.ok, data };
  }

  return {
    get: (urlPath, opts) => request("GET", urlPath, opts),
    post: (urlPath, opts) => request("POST", urlPath, opts),
    put: (urlPath, opts) => request("PUT", urlPath, opts),
    patch: (urlPath, opts) => request("PATCH", urlPath, opts),
    delete: (urlPath, opts) => request("DELETE", urlPath, opts),

    /**
     * Upload a file via multipart form data.
     * @param {string} urlPath - API endpoint path
     * @param {string} filePath - Local file path to upload
     * @param {string} [fieldName="file"] - Form field name (Task API trees/routines require "content")
     */
    async uploadFile(urlPath, filePath, fieldName = "file") {
      const fileBuffer = await readFile(filePath);
      const fileName = path.basename(filePath);
      const blob = new Blob([fileBuffer]);
      const form = new FormData();
      form.append(fieldName, blob, fileName);

      return request("POST", urlPath, { body: form });
    },
  };
}
