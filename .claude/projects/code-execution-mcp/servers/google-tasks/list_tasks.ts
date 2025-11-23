/**
 * Google Tasks MCP Wrapper: list_tasks
 *
 * Retrieves tasks from a specific list.
 *
 * @param taskListId - ID of the task list
 * @param options - Optional filters (status, limit, search)
 * @returns Promise with MCP result containing tasks array
 *
 * NOTE: MCP has a maximum limit of ~100 tasks per list per call.
 * Response structure: { tasks: [], total: number }
 * Task fields: id, title, status ('pending'|'completed'|'cancelled'), due, notes, etc.
 */
import { spawn } from 'child_process';
import { loadGoogleCredentials } from './load_credentials';

export interface ListTasksOptions {
  /** Filter by status: 'pending' | 'completed' | 'cancelled' */
  status?: 'pending' | 'completed' | 'cancelled';
  /** Maximum number of tasks to return (max ~100) */
  limit?: number;
  /** Text search in title/description */
  search?: string;
}

export async function listTasks(taskListId: string, options?: ListTasksOptions): Promise<any> {
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

    let buffer = '', initialized = false;

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

            // Build filters object
            const filters: any = {};
            if (options?.status) filters.status = options.status;
            if (options?.limit) filters.limit = options.limit;
            if (options?.search) filters.search = options.search;

            const args: any = { listId: taskListId };
            if (Object.keys(filters).length > 0) args.filters = filters;

            const req = { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'getTasks', arguments: args } };
            mcp.stdin.write(JSON.stringify(req) + '\n');
          }
          if (response.id === 2) {
            mcp.kill();
            response.error ? reject(new Error('MCP Error: ' + JSON.stringify(response.error))) : resolve(response.result);
          }
        } catch (error) {}
      }
    });

    mcp.stderr.on('data', () => {});
    mcp.on('error', (error: Error) => reject(error));
    mcp.on('close', (code: number) => { if (code !== 0 && !initialized) reject(new Error('MCP exited with code ' + code)); });

    const init = { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'google-tasks-wrapper', version: '1.0.0' }}};
    setTimeout(() => mcp.stdin.write(JSON.stringify(init) + '\n'), 100);
    setTimeout(() => { if (!initialized) { mcp.kill(); reject(new Error('Timeout')); } }, 15000);
  });
}
