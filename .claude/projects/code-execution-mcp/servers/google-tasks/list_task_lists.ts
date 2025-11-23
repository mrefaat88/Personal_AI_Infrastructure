/**
 * List all task lists
 *
 * Generated wrapper for MCP tool: list_task_lists
 * MCP Server: google-tasks
 *
 * @returns Promise with tool execution result
 */
import { loadGoogleCredentials } from './load_credentials';

export async function listTaskLists(): Promise<any> {
  const { spawn } = await import('child_process');

  // Load credentials from file
  const credentials = loadGoogleCredentials();

  return new Promise((resolve, reject) => {
    const bunPath = path.join(process.env.HOME || '', '.bun', 'bin', 'bun');
    const proc = spawn(bunPath, ['x', "@brandcast_app/google-tasks-mcp", {
      env: {
        ...process.env,
        // Credentials from ~/.claude/credentials/google.env
        GOOGLE_CLIENT_ID: credentials.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: credentials.GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN: credentials.GOOGLE_REFRESH_TOKEN,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let buffer = '';
    let initialized = false;
    let requestId = 1;

    proc.stdout?.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

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
                name: 'listTaskLists',
                arguments: {},
              },
            };
            proc.stdin?.write(JSON.stringify(callRequest) + '\n');
            continue;
          }

          // Handle tools/call response
          if (response.id === 2) {
            if (response.result !== undefined) {
              resolve(response.result);
              proc.kill();
              return;
            }
            if (response.error) {
              reject(new Error(`MCP Error: ${JSON.stringify(response.error)}`));
              proc.kill();
              return;
            }
          }
        } catch (e) {
          // Not JSON, continue
        }
      }
    });

    let stderrBuffer = '';
    proc.stderr?.on('data', (data) => {
      stderrBuffer += data.toString();
      // Log stderr for debugging
      console.error('[MCP stderr]:', data.toString());
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to spawn MCP google-tasks: ${error.message}`));
    });

    proc.on('close', (code) => {
      if (!initialized || code !== 0) {
        // Don't error if we already got the result
        if (code !== null && code !== 0) {
          const errorMsg = stderrBuffer ? `\nStderr: ${stderrBuffer}` : '';
          reject(new Error(`MCP google-tasks exited with code ${code}${errorMsg}`));
        }
      }
    });

    // Send initialization request first
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'code-execution-wrapper',
          version: '1.0.0',
        },
      },
    };

    proc.stdin?.write(JSON.stringify(initRequest) + '\n');
  });
}
