#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Wrapper: search_jira_issues
 *
 * Search Jira issues using JQL (Jira Query Language).
 * This is the most powerful Jira search tool - allows complex queries using JQL.
 *
 * @param params - Search parameters
 * @param params.jql - JQL query string (required)
 * @param params.maxResults - Maximum number of results to return (optional, default: 50)
 *
 * @returns Promise with MCP result containing matching issues
 *
 * @example
 * ```typescript
 * // Find all unresolved issues assigned to current user
 * await searchJiraIssues({
 *   jql: "assignee = currentUser() AND resolution = Unresolved"
 * });
 *
 * // Find in-progress issues in EDIX project
 * await searchJiraIssues({
 *   jql: 'project = "EDIX" AND status = "In Progress"',
 *   maxResults: 25
 * });
 *
 * // Find recent issues reported by current user
 * await searchJiraIssues({
 *   jql: "reporter = currentUser() ORDER BY created DESC",
 *   maxResults: 10
 * });
 *
 * // Search by labels and component
 * await searchJiraIssues({
 *   jql: 'labels = "urgent" AND component = "backend"'
 * });
 * ```
 *
 * @see https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/
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
 * Search parameters interface
 */
export interface SearchJiraIssuesParams {
  jql: string;
  maxResults?: number;
}

export async function searchJiraIssues(params: SearchJiraIssuesParams): Promise<any> {
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

            // Send tools/call request for search_jira_issues
            const req = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'search_jira_issues',
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
  // Accept JQL from command line or use default
  const jql = process.argv[2] || "assignee = currentUser() AND resolution = Unresolved";
  const maxResults = process.argv[3] ? parseInt(process.argv[3]) : 5;

  console.log(`🔍 Testing JQL search: "${jql}"`);
  console.log(`📊 Max results: ${maxResults}\n`);

  searchJiraIssues({ jql, maxResults })
    .then((result) => {
      console.log("\n✅ Success: Search completed");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("\n❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
