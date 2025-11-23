# Code Execution MCP - Portability Guide

**Last Updated:** 2025-11-23
**Status:** ✅ Production Pattern

## Overview

This guide ensures all code execution scripts and MCP wrappers are portable across:
- Different users (no hardcoded emails, user IDs)
- Different machines (macOS, Linux, Windows)
- Different installations (~/.claude location may vary)

---

## 🚨 CRITICAL: Common vs Inline Pattern

### When to Use Common Query Scripts

**Create reusable scripts for:**
- Frequently-used operations ("today's events", "upcoming tasks", "check DMs")
- Operations with complex formatting/filtering logic
- Queries that multiple users/contexts will reuse

**Location:** `servers/{mcp-name}/common-queries/` OR directly in `servers/{mcp-name}/`

**Example:**
```
servers/
└── google-calendar/
    ├── list_events.ts          # Low-level MCP wrapper
    ├── get_current_time.ts     # Low-level MCP wrapper
    ├── today-events.ts         # ✅ Common query script
    ├── this-week-events.ts     # ✅ Common query script
    └── index.ts
```

**Benefits:**
- No code duplication
- Consistent behavior
- Easier maintenance
- Documented in skills (users know they exist)

### When to Use Inline Code

**Write inline code for:**
- One-off queries specific to current context
- Simple operations (single function call + basic filtering)
- User-specific requests that won't be reused

**Example:**
```typescript
#!/usr/bin/env npx tsx
import { listEvents } from '${HOME}/.claude/projects/code-execution-mcp/servers/google-calendar';

// Quick one-off query for specific date range
const result = await listEvents({
  calendarId: 'primary',
  timeMin: '2025-12-01T00:00:00',
  timeMax: '2025-12-07T23:59:59',
  timeZone: 'Asia/Riyadh'
});

console.log(JSON.parse(result.content[0].text).events.length);
```

**Benefits:**
- Faster for simple queries
- No need to create/maintain script files
- Clearer for context-specific logic

---

## Portability Rules

### Rule 1: No Hardcoded User Information

❌ **BAD:**
```typescript
const userEmail = 'm.refaat@intelmatix.ai';
const userId = 'U0565H62NUX';
const userName = 'Mohammad Refaat';
```

✅ **GOOD:**
```typescript
// Load from environment variables
const userEmail = process.env.USER_EMAIL || process.env.GOOGLE_USER_EMAIL;
const userId = process.env.SLACK_USER_ID;
const userName = process.env.USER_NAME;

// Fail fast if required
if (!userId) {
  console.error('ERROR: SLACK_USER_ID must be set in ~/.claude/.env');
  process.exit(1);
}
```

### Rule 2: No Hardcoded Absolute Paths

❌ **BAD:**
```typescript
import { listEvents } from '/Users/mrefaat/.claude/projects/code-execution-mcp/servers/google-calendar';
import { listEvents } from '/home/emyth/.claude/projects/code-execution-mcp/servers/google-calendar';
```

✅ **GOOD:**

**For Documentation (Skills):**
```typescript
// Use ${process.env.HOME} placeholder - AI will expand at runtime
import { listEvents } from '${process.env.HOME}/.claude/projects/code-execution-mcp/servers/google-calendar';
```

**For Actual Scripts:**
```typescript
// Use dynamic path construction
import * as path from 'path';
const HOME = process.env.HOME || process.env.USERPROFILE || '';
// Then use absolute path with actual HOME value when AI generates code
```

**For Common Query Scripts in Server Directory:**
```typescript
// Use relative imports - scripts live alongside wrappers
import { listEvents } from './list_events';
import { getCurrentTime } from './get_current_time';
```

### Rule 3: Portable Command Execution

❌ **BAD:**
```typescript
const proc = spawn('bunx', ['@cocal/google-calendar-mcp'], { ... });
```

✅ **GOOD:**
```typescript
import * as path from 'path';

const bunPath = path.join(process.env.HOME || '', '.bun', 'bin', 'bun');
const proc = spawn(bunPath, ['x', '@cocal/google-calendar-mcp'], { ... });
```

### Rule 4: Portable File Paths

❌ **BAD:**
```python
ENV_FILE = '/Users/mrefaat/.claude/.env'
CREDENTIAL_FILE = '/home/emyth/PAI/.claude/credentials/google.env'
```

✅ **GOOD:**
```python
import os
from pathlib import Path

HOME = Path.home()
ENV_FILE = HOME / '.claude' / '.env'
CREDENTIAL_FILE = HOME / '.claude' / 'credentials' / 'google.env'
```

### Rule 5: Cross-Platform Path Handling

❌ **BAD:**
```typescript
const configPath = process.env.HOME + '/.claude/config.json';
```

✅ **GOOD:**
```typescript
import * as path from 'path';

const configPath = path.join(process.env.HOME || '', '.claude', 'config.json');
```

---

## Environment Variables Pattern

### Required for Portability

Create `~/.claude/.env` (or `~/.env`) with user-specific values:

```bash
# User Identity (for filtering in outputs)
USER_EMAIL=m.refaat@intelmatix.ai
GOOGLE_USER_EMAIL=m.refaat@intelmatix.ai
USER_NAME=Mohammad Refaat

# Service-Specific IDs
SLACK_USER_ID=U0565H62NUX
SLACK_TEAM_ID=T056A3XQ5TA

# API Credentials
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
SLACK_BOT_TOKEN=xoxb-...
```

### Loading in TypeScript

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load from ~/.claude/.env or fallback to ~/.env
const envPath = path.join(process.env.HOME || '', '.claude', '.env');
dotenv.config({ path: envPath });

// Fallback to ~/.env
if (!process.env.USER_EMAIL) {
  dotenv.config({ path: path.join(process.env.HOME || '', '.env') });
}
```

### Loading in Python

```python
import os
from pathlib import Path
from dotenv import load_dotenv

HOME = Path.home()

# Load from ~/.claude/.env or fallback to ~/.env
env_path = HOME / '.claude' / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv(HOME / '.env')

# Required variables
USER_EMAIL = os.getenv('USER_EMAIL')
if not USER_EMAIL:
    print('ERROR: USER_EMAIL must be set in .env file', file=sys.stderr)
    sys.exit(1)
```

---

## Common Query Script Template

**Location:** `servers/{mcp-name}/{operation}-{scope}.ts`

**Example:** `servers/google-calendar/today-events.ts`

```typescript
#!/usr/bin/env npx tsx
/**
 * Common Query: Get today's calendar events
 *
 * Usage:
 *   npx tsx ~/.claude/projects/code-execution-mcp/servers/google-calendar/today-events.ts
 *
 * Environment Variables:
 *   - USER_EMAIL or GOOGLE_USER_EMAIL: Optional - filters this email from attendees
 *   - TZ: Optional - timezone for "today" calculation (default: Asia/Riyadh)
 */

// ✅ PORTABLE: Use relative imports (script lives in server directory)
import { listEvents } from './list_events';
import * as path from 'path';

// ✅ PORTABLE: Load user-specific settings from environment
const userEmail = process.env.USER_EMAIL || process.env.GOOGLE_USER_EMAIL || '';
const timezone = process.env.TZ || 'Asia/Riyadh';

// MCP response interface
interface CalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string; timeZone?: string; };
  end?: { dateTime?: string; date?: string; timeZone?: string; };
  attendees?: Array<{ email: string; displayName?: string; }>;
  location?: string;
  hangoutLink?: string;
}

// Helper to parse MCP response
function parseEvents(result: any): CalendarEvent[] {
  const text = result.content[0]?.text || '';
  const parsed = JSON.parse(text);
  return parsed.events || [];
}

// Format dates WITHOUT milliseconds (MCP requirement)
const formatISO = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, '');

async function getTodayEvents() {
  // Calculate today's date range in user's timezone
  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 0);

  // Fetch events
  const result = await listEvents({
    calendarId: 'primary',
    timeMin: formatISO(startOfDay),
    timeMax: formatISO(endOfDay),
    timeZone: timezone
  });

  const events = parseEvents(result);

  // Format and display (filter out user's email if provided)
  events.forEach((event, index) => {
    console.log(`${index + 1}. ${event.summary}`);

    if (event.attendees && event.attendees.length > 0) {
      // ✅ PORTABLE: Filter using env variable, not hardcoded email
      const attendeeNames = event.attendees
        .filter(a => !userEmail || a.email !== userEmail)
        .map(a => a.displayName || a.email)
        .join(', ');

      if (attendeeNames) {
        console.log(`   Attendees: ${attendeeNames}`);
      }
    }
  });
}

getTodayEvents().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
```

---

## Testing Portability

### Checklist for Common Query Scripts

- [ ] No hardcoded user emails, IDs, or names
- [ ] Uses relative imports (if in server directory)
- [ ] Uses environment variables for user-specific data
- [ ] Works across macOS, Linux, Windows (path.join, not string concatenation)
- [ ] Documented in corresponding skill's "Common Query Scripts" section
- [ ] Usage example provided with environment variables listed
- [ ] Error messages indicate which env vars are missing

### Checklist for MCP Wrappers

- [ ] No hardcoded credentials (use env vars or credential loaders)
- [ ] Portable bun path: `path.join(process.env.HOME, '.bun', 'bin', 'bun')`
- [ ] Cross-platform path handling (path.join, not string concatenation)
- [ ] Graceful error handling for missing credentials
- [ ] TypeScript interfaces defined for return types

---

## Documentation Requirements

### Update Skill Documentation

When adding a common query script, update the skill's SKILL.md:

```markdown
## Common Query Scripts

**Location:** `~/.claude/projects/code-execution-mcp/servers/{mcp-name}/`

### {operation}-{scope}.ts
**Usage:** Get {description}
```bash
npx tsx ~/.claude/projects/code-execution-mcp/servers/{mcp-name}/{script-name}.ts
```

**Features:**
- {Feature 1}
- {Feature 2}

**When to use:**
- "{User query example 1}"
- "{User query example 2}"

**Environment Variables:**
- `VAR_NAME`: Optional/Required - description
```

---

## Real-World Examples

### Example 1: Google Calendar today-events.ts

**File:** `servers/google-calendar/today-events.ts`
**Portable Features:**
- Relative imports (lives in server directory)
- USER_EMAIL env var for filtering attendees
- TZ env var for timezone (default: Asia/Riyadh)
- Cross-platform date handling

**Documented in:** `~/.claude/skills/google-calendar/SKILL.md`

### Example 2: Slack check_dms.py

**File:** `~/.claude/skills/slack/check_dms.py`
**Portable Features:**
- Path.home() for cross-platform home directory
- SLACK_USER_ID required from .env (no hardcoded fallback)
- Clear error messages for missing env vars

**Documented in:** `~/.claude/skills/slack/SKILL.md`

---

## Migration from Hardcoded Scripts

### Before (Non-Portable)

```typescript
// ❌ Hardcoded paths, emails, credentials
import { listEvents } from '/Users/mrefaat/.claude/projects/code-execution-mcp/servers/google-calendar';

const events = parseEvents(result);
const filtered = events.filter(e =>
  !e.attendees?.some(a => a.email === 'm.refaat@intelmatix.ai')
);
```

### After (Portable)

```typescript
// ✅ Relative import, env-based filtering
import { listEvents } from './list_events';

const userEmail = process.env.USER_EMAIL || process.env.GOOGLE_USER_EMAIL;
const events = parseEvents(result);
const filtered = events.filter(e =>
  !userEmail || !e.attendees?.some(a => a.email === userEmail)
);
```

---

## Summary

**For AI Agents Creating Scripts:**

1. **Inline code:** Simple, one-off queries → write directly in conversation context
2. **Common scripts:** Frequently-used queries → create in server directory, document in skill
3. **Always portable:** No hardcoded user info, use env vars, relative/dynamic paths
4. **Test across users:** Ensure script works without modification on different machines

**For Users:**

1. Set up `~/.claude/.env` with your user-specific values
2. Common query scripts work out-of-the-box once env vars are set
3. Check skill documentation for available common scripts
4. Run scripts directly: `npx tsx ~/.claude/projects/code-execution-mcp/servers/{mcp}/{script}.ts`
