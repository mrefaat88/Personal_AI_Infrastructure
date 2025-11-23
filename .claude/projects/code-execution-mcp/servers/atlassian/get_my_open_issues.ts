#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Wrapper: get_my_unresolved_issues
 *
 * Retrieves all unresolved Jira issues assigned to the authenticated user.
 * This is the POC wrapper for Atlassian MCP integration.
 *
 * @returns Promise with MCP result containing unresolved issues
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

export async function getMyUnresolvedIssues(): Promise<any> {
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

            // Send tools/call request for get_my_unresolved_issues
            const req = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'get_my_unresolved_issues',
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
  getMyUnresolvedIssues()
    .then((result) => {
      console.log("✅ Success: Retrieved unresolved Jira issues");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
