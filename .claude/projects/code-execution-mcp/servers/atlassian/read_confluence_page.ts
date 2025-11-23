#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Wrapper: read_confluence_page
 *
 * Reads a specific Confluence page by ID or by title and space key.
 * Returns page content, metadata, and attachments.
 *
 * @param params - Parameters for reading the page
 * @param params.pageId - (Optional) The Confluence page ID. Use this alone if you know the page ID.
 * @param params.title - (Optional) The page title. Must be used together with spaceKey.
 * @param params.spaceKey - (Optional) The space key. Required when using title parameter.
 *
 * @returns Promise with MCP result containing page content and metadata
 *
 * @example
 * // Read by page ID
 * readConfluencePage({ pageId: "123456789" })
 *
 * @example
 * // Read by title and space
 * readConfluencePage({
 *   title: "Architecture Overview",
 *   spaceKey: "EDIX"
 * })
 *
 * @throws Error if neither pageId nor (title + spaceKey) are provided
 * @throws Error if title is provided without spaceKey
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import * as path from 'path';

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

interface ReadConfluencePageParams {
  pageId?: string;
  title?: string;
  spaceKey?: string;
}

export async function readConfluencePage(params: ReadConfluencePageParams): Promise<any> {
  // Validate parameter combinations
  if (!params.pageId && (!params.title || !params.spaceKey)) {
    throw new Error('Must provide either pageId alone OR both title and spaceKey together');
  }

  if (params.title && !params.spaceKey) {
    throw new Error('spaceKey is required when using title parameter');
  }

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

            // Send tools/call request for read_confluence_page
            const req = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'read_confluence_page',
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
  // Test with example parameters - you can change these
  const testParams: ReadConfluencePageParams = {
    // Option 1: Test by page ID (uncomment and add real page ID)
    // pageId: "123456789"

    // Option 2: Test by title and space (uncomment and add real values)
    title: "Home",
    spaceKey: "~ADMIN"
  };

  console.log(`🔍 Testing read_confluence_page with params:`, testParams);

  readConfluencePage(testParams)
    .then((result) => {
      console.log("✅ Success: Retrieved Confluence page");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
