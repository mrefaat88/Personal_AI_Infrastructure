#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Wrapper: search_confluence_pages
 *
 * Search Confluence pages using CQL (Confluence Query Language).
 * Provides powerful search capabilities across Confluence spaces.
 *
 * @param params.cql - CQL query string (required)
 * @param params.limit - Maximum number of results to return (optional, default: 25)
 *
 * @example
 * // Search for pages in a specific space
 * searchConfluencePages({ cql: 'type=page AND space=EDIX' })
 *
 * @example
 * // Search for recently modified pages containing specific text
 * searchConfluencePages({
 *   cql: 'text ~ "architecture" AND lastModified > now("-30d")',
 *   limit: 10
 * })
 *
 * @example
 * // Search by creator and date range
 * searchConfluencePages({
 *   cql: 'creator = currentUser() AND created > "2025-01-01"'
 * })
 *
 * @example
 * // Complex search with multiple conditions
 * searchConfluencePages({
 *   cql: 'space in (EDIX, DOCS) AND type=page AND label = "technical-spec"',
 *   limit: 50
 * })
 *
 * @example
 * // Search for pages with specific title pattern
 * searchConfluencePages({
 *   cql: 'title ~ "API*" AND space = EDIX'
 * })
 *
 * @returns Promise with MCP result containing matching Confluence pages
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import * as path from 'path';

/**
 * Interface for search_confluence_pages parameters
 */
interface SearchConfluencePagesParams {
  cql: string;
  limit?: number;
}

// Load credentials from env file
const credPath = path.resolve(
  process.env.HOME || "",
  ".claude/credentials/atlassian.env"
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

export async function searchConfluencePages(params: SearchConfluencePagesParams): Promise<any> {
  return new Promise((resolve, reject) => {
    const mcp = spawn('npx', ['-y', 'mcp-atlassian'], {
      env: {
        ...process.env,
        ...envVars,
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let buffer = '', initialized = false;

    mcp.stdout.on('data', (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const response = JSON.parse(line);

          // Handle initialization response
          if (response.id === 1 && !initialized) {
            initialized = true;

            // Send tools/call request for search_confluence_pages
            const req = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'search_confluence_pages',
                arguments: params
              }
            };
            mcp.stdin.write(JSON.stringify(req) + '\n');
            continue;
          }

          // Handle tool response
          if (response.id === 2) {
            if (response.error) {
              reject(new Error(response.error.message || 'MCP call failed'));
            } else {
              resolve(response.result);
            }
            mcp.kill();
            return;
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }
    });

    mcp.stderr.on('data', (data: Buffer) => {
      console.error('[MCP STDERR]', data.toString());
    });

    mcp.on('error', (err: Error) => {
      reject(new Error(`Failed to spawn MCP: ${err.message}`));
    });

    mcp.on('close', (code: number | null) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`MCP process exited with code ${code}`));
      }
    });

    // Send initialization request
    const initReq = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'atlassian-wrapper',
          version: '1.0.0',
        },
      },
    };
    mcp.stdin.write(JSON.stringify(initReq) + '\n');
  });
}

// CLI test mode
if (import.meta.url === `file://${process.argv[1]}`) {
  // Test with a simple CQL query - search for pages in EDIX space
  const testCql = 'type=page AND space=EDIX';

  console.log(`🔍 Testing search_confluence_pages with CQL: "${testCql}"`);
  console.log('📄 Limiting results to 5 pages...\n');

  searchConfluencePages({ cql: testCql, limit: 5 })
    .then((result) => {
      console.log("✅ Success: Retrieved Confluence pages");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
