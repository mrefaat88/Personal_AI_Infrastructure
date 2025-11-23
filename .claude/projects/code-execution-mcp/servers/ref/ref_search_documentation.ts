#!/usr/bin/env npx tsx

/**
 * Ref.tools MCP Wrapper: ref_search_documentation
 *
 * Search for technical documentation across public APIs, libraries, repos, or the web.
 * Ideal for finding facts, code snippets, or detailed information about technologies.
 *
 * ARCHITECTURE: HTTP-based MCP wrapper
 * - Uses fetch() to call https://api.ref.tools/mcp
 * - No process spawning (unlike stdio-based wrappers)
 * - Simpler dependency management
 * - Always up-to-date (server-side)
 *
 * @module servers/ref/ref_search_documentation
 */

import { readFileSync } from 'fs';
import * as path from 'path';

/**
 * Parameters for searching documentation
 */
export interface RefSearchDocumentationParams {
  /** Search query - what to search for */
  query: string;

  /** Optional: Specific source to search (e.g., "react", "python", "typescript") */
  source?: string;

  /** Optional: Maximum number of results */
  maxResults?: number;
}

/**
 * Search technical documentation using Ref.tools
 *
 * @param params - Search parameters
 * @returns Promise with search results
 *
 * @example
 * ```typescript
 * // Search React documentation
 * const results = await refSearchDocumentation({
 *   query: "useState hook examples",
 *   source: "react",
 *   maxResults: 5
 * });
 *
 * // Search Python documentation
 * const pythonResults = await refSearchDocumentation({
 *   query: "async await syntax"
 * });
 *
 * // Search for library information
 * const libResults = await refSearchDocumentation({
 *   query: "axios http client configuration"
 * });
 * ```
 */
export async function refSearchDocumentation(
  params: RefSearchDocumentationParams
): Promise<any> {
  // Load API key from credentials
  const credPath = path.resolve(
    process.env.HOME || "",
    ".claude/credentials/ref.env"
  );

  const envContent = readFileSync(credPath, "utf-8");
  const envVars: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  const apiKey = envVars.REF_API_KEY;
  if (!apiKey) {
    throw new Error('REF_API_KEY not found in credentials file');
  }

  const url = `https://api.ref.tools/mcp`;

  try {
    // Step 1: Initialize session
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'ref-wrapper',
          version: '1.0.0'
        }
      }
    };

    const initResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'x-ref-api-key': apiKey,
      },
      body: JSON.stringify(initRequest)
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Init failed! status: ${initResponse.status}, body: ${errorText}`);
    }

    // Get session ID from response headers
    const sessionId = initResponse.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('No session ID received from initialization');
    }

    // Step 2: Call the tool with session ID
    const toolRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'ref_search_documentation',
        arguments: {
          query: params.query,
          ...(params.source && { source: params.source }),
          ...(params.maxResults && { max_results: params.maxResults })
        }
      }
    };

    const toolResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'x-ref-api-key': apiKey,
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify(toolRequest)
    });

    if (!toolResponse.ok) {
      const errorText = await toolResponse.text();
      throw new Error(`Tool call failed! status: ${toolResponse.status}, body: ${errorText}`);
    }

    const data = await toolResponse.json();

    if (data.error) {
      throw new Error(data.error.message || 'MCP call failed');
    }

    return data.result;
  } catch (error) {
    throw new Error(`Failed to search documentation: ${error instanceof Error ? error.message : error}`);
  }
}

// CLI test mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const testQuery = process.argv[2] || "React hooks useState";
  const testSource = process.argv[3];

  console.log(`🔍 Testing ref_search_documentation...`);
  console.log(`   Query: "${testQuery}"`);
  if (testSource) console.log(`   Source: "${testSource}"`);
  console.log('');

  refSearchDocumentation({
    query: testQuery,
    ...(testSource && { source: testSource }),
    maxResults: 3
  })
    .then((result) => {
      console.log("✅ Success:");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
