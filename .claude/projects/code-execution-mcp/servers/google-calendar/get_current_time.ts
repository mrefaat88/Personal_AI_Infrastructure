/**
 * Get current time in calendar timezone
 *
 * Generated wrapper for MCP tool: get-current-time
 * MCP Server: google-calendar
 *
 * @param params - Optional parameters
 * @param params.timeZone - Optional IANA timezone (defaults to calendar timezone)
 * @returns Promise with current time info
 */
import * as path from 'path';

interface GetCurrentTimeParams {
  /** Optional IANA timezone */
  timeZone?: string;
}

export async function getCurrentTime(params?: GetCurrentTimeParams): Promise<any> {
  const { spawn } = await import('child_process');

  // Path to shared Google OAuth credentials
  const credPath = path.resolve(
    process.env.HOME || '',
    '.claude/credentials/google-oauth.json'
  );

  return new Promise((resolve, reject) => {
    const bunPath = path.join(process.env.HOME || '', '.bun', 'bin', 'bun');
    const proc = spawn(bunPath, ['x', '@cocal/google-calendar-mcp'], {
      env: {
        ...process.env,
        // OAuth credentials file path
        GOOGLE_OAUTH_CREDENTIALS: credPath,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let buffer = '';
    let initialized = false;

    proc.stdout?.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const response = JSON.parse(line);

          // Handle initialization response (id=1)
          if (response.id === 1 && !initialized) {
            initialized = true;
            // Send tools/call request after initialization
            const callRequest = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'get-current-time',
                arguments: params || {},
              },
            };
            proc.stdin?.write(JSON.stringify(callRequest) + '\n');
            continue;
          }

          // Handle tools/call response (id=2) - this is the actual data
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
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to spawn MCP google-calendar: ${error.message}`));
    });

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`MCP google-calendar exited with code ${code}\nStderr: ${stderrBuffer}`));
      }
    });

    // Send initialize request first
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'code-execution-client', version: '1.0.0' },
      },
    };
    proc.stdin?.write(JSON.stringify(initRequest) + '\n');
  });
}
