#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Wrapper: list_jira_projects
 *
 * Lists all accessible Jira projects for the authenticated user.
 * Returns project keys, names, descriptions, and other metadata.
 *
 * @returns Promise with MCP result containing list of accessible Jira projects
 *
 * @example
 * const result = await listJiraProjects();
 * // Returns: { content: [{ type: "text", text: "..." }] }
 * // Text contains project keys, names, and descriptions
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

/**
 * Lists all accessible Jira projects
 *
 * @returns Promise resolving to MCP result with project list
 * @throws Error if MCP call fails or process encounters an error
 */
export async function listJiraProjects(): Promise<any> {
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

            // Send tools/call request for list_jira_projects
            const req = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'list_jira_projects',
                arguments: {} // No parameters needed
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
  listJiraProjects()
    .then((result) => {
      console.log("✅ Success: Retrieved Jira projects list");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
