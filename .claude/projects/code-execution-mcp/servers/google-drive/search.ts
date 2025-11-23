/**
 * Google Drive MCP Wrapper: search
 *
 * Search for files in Google Drive
 */

import { spawn } from 'child_process';
import * as path from 'path';

interface MCPMessage {
  jsonrpc: string;
  id?: number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export async function search(query: string): Promise<any> {
  // Path to shared Google OAuth credentials
  const credPath = path.resolve(
    process.env.HOME || '',
    '.claude/credentials/google-oauth.json'
  );

  return new Promise((resolve, reject) => {
    const mcp = spawn('npx', ['-y', '@piotr-agier/google-drive-mcp'], {
      env: {
        ...process.env,
        // OAuth credentials file path
        GOOGLE_DRIVE_OAUTH_CREDENTIALS: credPath,
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseBuffer = '';
    let messageId = 1;
    let initialized = false;
    let resultReceived = false;

    mcp.stdout.on('data', (data: Buffer) => {
      responseBuffer += data.toString();
      const lines = responseBuffer.split('\n');
      responseBuffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const message: MCPMessage = JSON.parse(line);

          // Handle initialize response
          if (message.id === 1 && message.result && !initialized) {
            initialized = true;

            // Send tools/call request
            const callRequest: MCPMessage = {
              jsonrpc: '2.0',
              id: messageId++,
              method: 'tools/call',
              params: {
                name: 'search',
                arguments: { query }
              }
            };
            mcp.stdin.write(JSON.stringify(callRequest) + '\n');
          }

          // Handle tools/call response
          if (message.id === 2 && message.result) {
            resultReceived = true;
            mcp.kill();
            resolve(message.result.content || message.result);
          }

          // Handle errors
          if (message.error) {
            mcp.kill();
            reject(new Error(message.error.message || JSON.stringify(message.error)));
          }
        } catch (error) {
          // Ignore parse errors
        }
      }
    });

    mcp.stderr.on('data', (data: Buffer) => {
      const stderr = data.toString();
      if (stderr.includes('error') || stderr.includes('Error')) {
        console.error('Drive MCP stderr:', stderr);
      }
    });

    mcp.on('error', (error: Error) => {
      reject(error);
    });

    mcp.on('close', (code: number) => {
      if (!resultReceived) {
        reject(new Error(`MCP exited with code ${code} before result received`));
      }
    });

    // Send initialize request
    const initRequest: MCPMessage = {
      jsonrpc: '2.0',
      id: messageId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'drive-wrapper',
          version: '1.0.0'
        }
      }
    };

    setTimeout(() => {
      mcp.stdin.write(JSON.stringify(initRequest) + '\n');
    }, 1000);

    // Timeout
    setTimeout(() => {
      if (!resultReceived) {
        mcp.kill();
        reject(new Error('Timeout'));
      }
    }, 15000);
  });
}
