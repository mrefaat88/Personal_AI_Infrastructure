/**
 * Google Tasks MCP Wrapper: update_task
 */

import { spawn } from 'child_process';
import { loadGoogleCredentials } from './load_credentials';

export async function updateTask(taskListId: string, taskId: string, updates: { title?: string; notes?: string; status?: string; due?: string }): Promise<any> {
  // Load credentials from file
  const credentials = loadGoogleCredentials();

  return new Promise((resolve, reject) => {
    const bunPath = path.join(process.env.HOME || "", ".bun", "bin", "bun");
    const mcp = spawn(bunPath, ['x', ['@brandcast_app/google-tasks-mcp'], {
      env: {
        ...process.env,
        // Credentials from ~/.claude/credentials/google.env
        GOOGLE_CLIENT_ID: credentials.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: credentials.GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN: credentials.GOOGLE_REFRESH_TOKEN,
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let buffer = '';
    let initialized = false;

    mcp.stdout.on('data', (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const response = JSON.parse(line);
          if (response.id === 1 && !initialized) {
            initialized = true;
            const callRequest = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: { name: 'updateTask', arguments: { taskListId, taskId, ...updates } },
            };
            mcp.stdin.write(JSON.stringify(callRequest) + '\n');
          }
          if (response.id === 2) {
            mcp.kill();
            response.error ? reject(new Error(`MCP Error: ${JSON.stringify(response.error)}`)) : resolve(response.result);
          }
        } catch (error) {}
      }
    });

    mcp.stderr.on('data', () => {});
    mcp.on('error', (error: Error) => reject(error));
    mcp.on('close', (code: number) => { if (code !== 0 && !initialized) reject(new Error(`MCP exited with code ${code}`)); });

    setTimeout(() => mcp.stdin.write(JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'google-tasks-wrapper', version: '1.0.0' }}
    }) + '\n'), 100);
    setTimeout(() => { if (!initialized) { mcp.kill(); reject(new Error('Timeout')); } }, 15000);
  });
}
