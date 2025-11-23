/**
 * Google Tasks MCP Wrapper: create_task
 *
 * Create a new task in a task list
 */

import { spawn } from 'child_process';
import { loadGoogleCredentials } from './load_credentials';

export async function createTask(taskListId: string, title: string, options?: { notes?: string; due?: string; parent?: string }): Promise<any> {
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

          // Handle initialization response
          if (response.id === 1 && !initialized) {
            initialized = true;
            // Send tools/call request after initialization
            const callRequest = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'createTask',
                arguments: {
                  taskListId,
                  title,
                  ...options
                },
              },
            };
            mcp.stdin.write(JSON.stringify(callRequest) + '\n');
          }

          // Handle tool call response
          if (response.id === 2) {
            mcp.kill();
            if (response.error) {
              reject(new Error(`MCP Error: ${JSON.stringify(response.error)}`));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // Ignore parse errors
        }
      }
    });

    mcp.stderr.on('data', (data: Buffer) => {
      const stderr = data.toString();
      // Only log actual errors, not info messages
      if (stderr.toLowerCase().includes('error') || stderr.toLowerCase().includes('failed')) {
        console.error('[MCP stderr]:', stderr);
      }
    });

    mcp.on('error', (error: Error) => {
      reject(error);
    });

    mcp.on('close', (code: number) => {
      if (code !== 0 && !initialized) {
        reject(new Error(`MCP exited with code ${code} before initialization`));
      }
    });

    // Send initialize request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'google-tasks-wrapper',
          version: '1.0.0'
        }
      }
    };

    setTimeout(() => {
      mcp.stdin.write(JSON.stringify(initRequest) + '\n');
    }, 100);

    setTimeout(() => {
      if (!initialized) {
        mcp.kill();
        reject(new Error('Timeout waiting for initialization'));
      }
    }, 15000);
  });
}
