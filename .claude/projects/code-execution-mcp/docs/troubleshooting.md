# Troubleshooting Guide - Google MCP Wrappers

## Common Issues and Solutions

This guide covers common problems encountered when using the code execution architecture with Google MCP wrappers.

---

## Table of Contents

1. [Installation & Setup Issues](#installation--setup-issues)
2. [Execution Errors](#execution-errors)
3. [Authentication & Permission Issues](#authentication--permission-issues)
4. [Performance Issues](#performance-issues)
5. [Data Parsing Issues](#data-parsing-issues)
6. [MCP Server Errors](#mcp-server-errors)
7. [Import & Module Issues](#import--module-issues)
8. [FAQ](#faq)

---

## Installation & Setup Issues

### Issue: "npx: command not found" or "tsx: command not found"

**Symptoms:**
```bash
bash: npx: command not found
```

**Cause:** Node.js or npm not installed/configured properly.

**Solution:**
```bash
# Check Node.js installation
node --version
# Should show v14+ (v20+ recommended)

# Check npm installation
npm --version
# Should show v6+ (v10+ recommended)

# If missing, install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Verify installations
node --version
npm --version
```

### Issue: "bunx: command not found"

**Symptoms:**
```bash
bunx: command not found
```

**Cause:** Some wrappers use `bunx` (from Bun runtime) which may not be installed.

**Solution:**

**Option 1 - Install Bun (faster):**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Option 2 - Replace bunx with npx (no install needed):**

Edit the wrapper file (e.g., `servers/google-tasks/list_task_lists.ts`):

```typescript
// Change this:
const mcp = spawn('bunx', ['@brandcast_app/google-tasks-mcp'], { ... });

// To this:
const mcp = spawn('npx', ['-y', '@brandcast_app/google-tasks-mcp'], { ... });
```

---

## Execution Errors

### Issue: "Timeout: MCP did not respond within 15000ms"

**Symptoms:**
```
Error: Timeout: MCP did not respond within 15000ms
```

**Cause:** MCP server took too long (network, package download, or complex query).

**Solution:**

**Option 1 - Increase timeout:**

Edit the wrapper file:

```typescript
const TIMEOUT_MS = 30000; // Increase from 15000 to 30000

setTimeout(() => {
  mcp.kill();
  cleanup();
  reject(new Error(`Timeout: MCP did not respond within ${TIMEOUT_MS}ms`));
}, TIMEOUT_MS);
```

**Option 2 - Check network connection:**
```bash
# Test network connectivity
ping google.com

# Check if MCP package is accessible
npm view @brandcast_app/google-tasks-mcp version
```

**Option 3 - Pre-install packages:**
```bash
# For Google Tasks
npm install -g @brandcast_app/google-tasks-mcp

# For Google Calendar
npm install -g @cocal/google-calendar-mcp

# For Google Drive
npm install -g @piotr-agier/google-drive-mcp
```

### Issue: "MCP exited with code 1" or non-zero exit code

**Symptoms:**
```
Error: MCP process exited with code 1
stderr: [Error messages...]
```

**Cause:** MCP server encountered an error (auth, invalid parameters, API issues).

**Solution:**

1. **Check stderr output** for specific error:
```typescript
// Stderr is captured in wrapper - check console output
```

2. **Common stderr errors and fixes:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid credentials" | OAuth token invalid/expired | Re-authenticate (see Auth section below) |
| "Rate limit exceeded" | Too many API calls | Wait 1-5 minutes, retry |
| "Task list not found" | Invalid list ID | Verify list ID exists via listTaskLists() |
| "Permission denied" | Insufficient OAuth scopes | Check OAuth scopes include required permissions |

3. **Enable verbose logging:**
```typescript
// Add to wrapper for debugging
mcp.stderr.on('data', (data) => {
  console.error('MCP STDERR:', data.toString());
});
mcp.stdout.on('data', (data) => {
  console.log('MCP STDOUT:', data.toString());
});
```

### Issue: "Cannot spawn MCP subprocess"

**Symptoms:**
```
Error: spawn bunx ENOENT
```

**Cause:** Command not found (bunx or npx not in PATH).

**Solution:**

1. **Verify PATH includes Node binaries:**
```bash
echo $PATH | grep -o "/.*node[^:]*"
which npx
which bunx
```

2. **Use absolute paths in wrapper:**
```typescript
const mcp = spawn('/home/emyth/.nvm/versions/node/v20.0.0/bin/npx', ['-y', '@brandcast_app/google-tasks-mcp'], { ... });
```

---

## Authentication & Permission Issues

### Issue: "OAuth credentials not found" or authentication errors

**Symptoms:**
```
Error: GOOGLE_OAUTH_CREDENTIALS file not found
Error: Invalid OAuth token
```

**Cause:** OAuth credentials missing, invalid, or expired.

**Solution:**

**For Google Tasks (env vars):**

1. Check credentials in wrapper hardcoded section:
```typescript
env: {
  GOOGLE_CLIENT_ID: 'your-client-id',
  GOOGLE_CLIENT_SECRET: 'your-client-secret',
  GOOGLE_REFRESH_TOKEN: 'your-refresh-token'
}
```

2. Verify credentials are correct in `.claude/.mcp.google.json`:
```bash
cat /home/emyth/PAI/.claude/.mcp.google.json
```

3. If expired, re-authenticate via original MCP setup.

**For Google Calendar (OAuth file):**

1. Check OAuth file exists:
```bash
ls -la /home/emyth/PAI/.claude/credentials/google-calendar-oauth.json
```

2. Verify credentials file path in wrapper:
```typescript
env: {
  GOOGLE_OAUTH_CREDENTIALS: '/home/emyth/PAI/.claude/credentials/google-calendar-oauth.json'
}
```

3. If missing/expired, regenerate OAuth token via MCP configuration.

**For Google Drive (OAuth file):**

Same as Calendar, but use:
```bash
/home/emyth/PAI/.claude/credentials/google-drive-work-oauth.json
```

### Issue: "Permission denied" when accessing Google APIs

**Symptoms:**
```
Error: The caller does not have permission
Error: Insufficient permission scopes
```

**Cause:** OAuth scopes don't include required permissions.

**Solution:**

1. **Check current OAuth scopes:**

Look at the OAuth consent screen when you authenticated. Required scopes:

- **Tasks:** `https://www.googleapis.com/auth/tasks`
- **Calendar:** `https://www.googleapis.com/auth/calendar.readonly` or `.readwrite`
- **Drive:** `https://www.googleapis.com/auth/drive.readonly` or `.file`

2. **Re-authenticate with correct scopes:**

Regenerate OAuth credentials via the MCP configuration with expanded scopes.

---

## Performance Issues

### Issue: Code execution is slow (>10 seconds)

**Symptoms:**
- Simple queries take >5 seconds
- Complex queries take >15 seconds

**Cause:** Multiple sequential MCP spawns, package downloads, or network latency.

**Solutions:**

**1. Pre-install packages (eliminates download time):**
```bash
npm install -g @brandcast_app/google-tasks-mcp
npm install -g @cocal/google-calendar-mcp
npm install -g @piotr-agier/google-drive-mcp
```

**2. Use parallel execution (where possible):**
```typescript
// Instead of sequential:
const lists = await listTaskLists();
const events = await listEvents();

// Use parallel:
const [lists, events] = await Promise.all([
  listTaskLists(),
  listEvents()
]);
```

**3. Reduce number of MCP calls:**
```typescript
// Instead of calling getTasks for each list:
for (const list of lists) {
  const tasks = await listTasks(list.id); // Multiple spawns!
}

// Batch or cache results:
const allTasksPromises = lists.map(list => listTasks(list.id));
const allTasksResults = await Promise.all(allTasksPromises);
```

### Issue: Parallel execution causes cache conflicts with bunx

**Symptoms:**
```
Error: Bun package cache conflict
```

**Cause:** Multiple bunx processes accessing cache simultaneously.

**Solution:**

Use **sequential execution** instead of parallel when using bunx:

```typescript
// Don't use Promise.all with bunx-based wrappers
const results = [];
for (const listId of listIds) {
  const tasks = await listTasks(listId); // Sequential
  results.push(tasks);
}
```

Or switch to `npx` which handles parallelism better.

---

## Data Parsing Issues

### Issue: "Cannot read property 'text' of undefined"

**Symptoms:**
```
TypeError: Cannot read property 'text' of undefined
```

**Cause:** MCP result format doesn't match expected structure.

**Solution:**

1. **Add defensive parsing:**
```typescript
const result = await listTaskLists();

// Instead of:
const text = result[0].text; // May fail

// Use:
const text = Array.isArray(result) && result[0]?.text ? result[0].text : '';
```

2. **Inspect actual result structure:**
```typescript
const result = await listTaskLists();
console.log('Result structure:', JSON.stringify(result, null, 2));
```

3. **Handle different formats:**
```typescript
function extractText(result: any): string {
  if (!result) return '';

  // Format 1: Array with content objects
  if (Array.isArray(result) && result[0]?.content?.[0]?.text) {
    return result[0].content[0].text;
  }

  // Format 2: Array with text property
  if (Array.isArray(result) && result[0]?.text) {
    return result[0].text;
  }

  // Format 3: Direct string
  if (typeof result === 'string') {
    return result;
  }

  return '';
}
```

### Issue: Task/event data not parsing correctly

**Symptoms:**
- Task lists showing as "undefined"
- Dates not extracting properly
- IDs missing from parsed results

**Cause:** MCP text format changed or regex doesn't match actual output.

**Solution:**

1. **Log raw MCP output:**
```typescript
const result = await listTasks('listId');
const text = extractText(result);
console.log('=== RAW MCP OUTPUT ===');
console.log(text);
console.log('======================');
```

2. **Update parsing regex to match actual format:**

Example for tasks:
```typescript
// If MCP output is:
// Title: [P0] Fix bug
// ID: abc123
// Due: 2025-11-30T23:59:59Z

function parseTasks(text: string) {
  const blocks = text.split('\n\n'); // Split by double newline

  return blocks.map(block => {
    const titleMatch = block.match(/Title: (.+)/);
    const idMatch = block.match(/ID: (.+)/);
    const dueMatch = block.match(/Due: (.+)/);

    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      id: idMatch ? idMatch[1].trim() : '',
      due: dueMatch ? dueMatch[1].trim() : null
    };
  }).filter(task => task.id); // Filter out empty results
}
```

---

## MCP Server Errors

### Issue: "MCP server returned invalid JSON-RPC response"

**Symptoms:**
```
Error: Invalid JSON-RPC response
Error: Unexpected token in JSON
```

**Cause:** MCP server output is not valid JSON-RPC format.

**Solution:**

1. **Check MCP output directly:**
```bash
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}' | bunx @brandcast_app/google-tasks-mcp
```

2. **Handle non-JSON output:**
```typescript
let result;
try {
  result = JSON.parse(line);
} catch (e) {
  console.error('Non-JSON output:', line);
  continue; // Skip this line
}
```

3. **Filter stdout for only JSON-RPC lines:**
```typescript
mcp.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(l => l.trim());

  for (const line of lines) {
    // Only process lines that look like JSON
    if (line.startsWith('{') && line.includes('jsonrpc')) {
      try {
        const result = JSON.parse(line);
        // Process result...
      } catch (e) {
        // Skip malformed JSON
      }
    }
  }
});
```

### Issue: "MCP initialization failed"

**Symptoms:**
```
Error: MCP did not initialize properly
Error: No initialize response
```

**Cause:** MCP server didn't respond to initialize request.

**Solution:**

1. **Verify initialization sequence:**
```typescript
// Send initialize FIRST
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {}
  }
};

mcp.stdin.write(JSON.stringify(initRequest) + '\n');

// Wait for initialize response before sending tools/call
```

2. **Add timeout for initialization:**
```typescript
const initTimeout = setTimeout(() => {
  reject(new Error('MCP initialization timeout'));
}, 5000);

// Clear timeout when initialized
clearTimeout(initTimeout);
```

---

## Import & Module Issues

### Issue: "Cannot find module" or import errors

**Symptoms:**
```
Error: Cannot find module './servers/google-tasks'
Error: Module not found
```

**Cause:** Import path incorrect or file doesn't exist.

**Solution:**

1. **Use absolute paths:**
```typescript
// Instead of relative:
import { listTaskLists } from './servers/google-tasks';

// Use absolute:
import { listTaskLists } from '/home/emyth/PAI/.claude/projects/code-execution-mcp/servers/google-tasks';
```

2. **Verify file exists:**
```bash
ls -la /home/emyth/PAI/.claude/projects/code-execution-mcp/servers/google-tasks/index.ts
```

3. **Check index.ts exports:**
```typescript
// servers/google-tasks/index.ts should have:
export { listTaskLists } from './list_task_lists';
export { listTasks } from './list_tasks';
// etc.
```

### Issue: TypeScript compilation errors

**Symptoms:**
```
Error: Property 'text' does not exist on type 'any'
Error: Type 'X' is not assignable to type 'Y'
```

**Cause:** TypeScript strict mode or missing type definitions.

**Solution:**

1. **Add type assertions:**
```typescript
const text = (result as any)[0]?.text || '';
```

2. **Use proper types:**
```typescript
interface MCPResult {
  type: string;
  text?: string;
}

const result = await listTaskLists() as MCPResult[];
```

3. **Disable strict mode (if needed):**
```typescript
// At top of file
// @ts-nocheck
```

---

## FAQ

### Q: Why is my first execution slow but subsequent ones faster?

**A:** First execution downloads npm packages (`npx -y` flag). Subsequent executions use cached packages. To speed up first run, pre-install packages:

```bash
npm install -g @brandcast_app/google-tasks-mcp
npm install -g @cocal/google-calendar-mcp
npm install -g @piotr-agier/google-drive-mcp
```

### Q: Can I use these wrappers outside Claude Code?

**A:** Yes! They're standard TypeScript files. Run them directly:

```bash
npx tsx /home/emyth/PAI/.claude/projects/code-execution-mcp/servers/google-tasks/list_task_lists.ts
```

Or import them in your own scripts:

```typescript
import { listTaskLists } from './servers/google-tasks';
```

### Q: How do I add more Google operations (e.g., createEvent)?

**A:** Generate new wrappers using the wrapper generator:

1. Discover available tools:
```typescript
npx tsx scripts/discover-calendar-tools.ts
```

2. Create wrapper manually using existing pattern:
```typescript
// servers/google-calendar/create_event.ts
import { spawn } from 'child_process';

export async function createEvent(summary: string, startTime: string, endTime: string) {
  // Follow pattern from list_events.ts
  // ...
}
```

3. Export in index.ts:
```typescript
export { createEvent } from './create_event';
```

### Q: What if I need to rollback to the old slash command architecture?

**A:** Use one of 3 rollback methods:

```bash
# Method 1: Automated (fastest)
bash /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/restore-backup.sh

# Method 2: Git (clean)
cd /home/emyth/PAI
git checkout 2cce9b31  # Checkpoint 1.5 baseline

# Method 3: Manual
# Restore from configs/backup/ and .claude/archive/
```

All backups are retained. See [rollback-plan.md](rollback-plan.md) for details.

### Q: How do I debug MCP communication issues?

**A:** Add verbose logging to wrappers:

```typescript
// Enable all MCP output
mcp.stdout.on('data', (data) => {
  console.log('[MCP STDOUT]', data.toString());
});

mcp.stderr.on('data', (data) => {
  console.error('[MCP STDERR]', data.toString());
});

// Log all JSON-RPC communication
const request = { jsonrpc: '2.0', ... };
console.log('[SEND]', JSON.stringify(request));

// When receiving
console.log('[RECV]', line);
```

### Q: Can I run multiple MCP operations in parallel?

**A:** Yes, but with caution:

**Safe (npx-based wrappers):**
```typescript
const [lists, events, files] = await Promise.all([
  listTaskLists(),
  listEvents(),
  search('query')
]);
```

**Unsafe (bunx-based wrappers):**
```typescript
// Bunx has cache conflicts with parallel spawns
// Use sequential instead:
const lists = await listTaskLists();
const events = await listEvents();
```

### Q: How do I handle large result sets (pagination)?

**A:** Implement pagination in wrapper or filter in code:

**Option 1 - Pagination in wrapper:**
```typescript
export async function listTasks(listId: string, maxResults: number = 100) {
  // Add maxResults to tool parameters
}
```

**Option 2 - Filter in code:**
```typescript
const allTasks = await listTasks('listId');
const text = extractText(allTasks);
const tasks = parseTasks(text);

// Process in chunks
const firstPage = tasks.slice(0, 100);
```

### Q: What's the difference between bunx and npx?

**A:**
- **bunx:** From Bun runtime, faster package execution, but has parallelism issues
- **npx:** From npm, slower but more stable, works with parallel execution

**Recommendation:** Use npx for production (change in wrapper files).

---

## Getting Additional Help

### Documentation
- **[USAGE-GUIDE.md](../USAGE-GUIDE.md)** - Comprehensive usage patterns
- **[CLAUDE-CODE-REFERENCE.md](../CLAUDE-CODE-REFERENCE.md)** - Quick reference
- **[docs/quick-start.md](quick-start.md)** - Getting started guide

### Debugging Resources
- **[examples/](../examples/)** - Working code examples
- **[CHECKPOINTS.md](../CHECKPOINTS.md)** - Test results and validation
- **[configs/backup/](../configs/backup/)** - Original working configurations

### Known Issues
Check [CHECKPOINTS.md](../CHECKPOINTS.md) for known issues encountered during migration.

---

**Last Updated:** 2025-11-22 (Checkpoint 4.4)
**Status:** Production Ready
