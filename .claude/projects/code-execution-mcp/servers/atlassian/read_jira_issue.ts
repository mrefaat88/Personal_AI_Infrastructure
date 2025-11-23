#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Wrapper: read_jira_issue
 *
 * Retrieves detailed information about a specific Jira issue by its key.
 * Returns comprehensive issue data including:
 * - Summary and description
 * - Status, priority, and issue type
 * - Assignee and reporter information
 * - Comments and activity history
 * - Custom fields and labels
 * - Attachments and linked issues
 *
 * @param params - Object containing:
 *   - issueKey (string, required): The Jira issue key (e.g., "EDIX-123", "PROJ-456")
 * @returns Promise with MCP result containing full issue details
 *
 * @example
 * ```typescript
 * const issue = await readJiraIssue({ issueKey: "EDIX-123" });
 * console.log(issue.fields.summary);
 * console.log(issue.fields.description);
 * console.log(issue.fields.status.name);
 * ```
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
 * Read a specific Jira issue by its key
 */
export async function readJiraIssue(params: { issueKey: string }): Promise<any> {
  return new Promise((resolve, reject) => {
    // Validate issueKey parameter
    if (!params.issueKey || typeof params.issueKey !== 'string') {
      reject(new Error('issueKey parameter is required and must be a string'));
      return;
    }

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

            // Send tools/call request for read_jira_issue
            const req = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'read_jira_issue',
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
  // Use a test issue key - can be passed as command-line argument
  const testIssueKey = process.argv[2] || 'EDIX-1';

  console.log(`🔍 Testing read_jira_issue with issueKey: ${testIssueKey}`);
  console.log(`💡 Usage: npx tsx read_jira_issue.ts <ISSUE-KEY>\n`);

  readJiraIssue({ issueKey: testIssueKey })
    .then((result) => {
      console.log("✅ Success: Retrieved Jira issue details");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
