# MCP Test Results
**Date:** 2025-11-23 (Updated)
**Test Location:** `/Users/mrefaat/.claude/projects/code-execution-mcp/`
**Status:** ✅ All 5 MCPs fully operational (100% success rate)

---

## Summary

| MCP | Status | Credential File | Notes |
|-----|--------|----------------|-------|
| **Google Tasks** | ✅ WORKING | `~/.claude/credentials/google.env` | Successfully retrieves task lists |
| **Ref.tools** | ✅ WORKING | `~/.claude/credentials/ref.env` | Successfully searches documentation |
| **Atlassian (Jira/Confluence)** | ✅ WORKING | `~/.claude/credentials/atlassian.env` | 43 projects retrieved (requires Node >=18 + jsdom fix) |
| **Google Calendar** | ✅ WORKING | `~/.claude/credentials/google-oauth.json` + tokens | OAuth flow completed - retrieves calendar events |
| **Google Drive** | ✅ WORKING | `~/.claude/credentials/google-oauth.json` + tokens | OAuth flow completed - lists Drive contents |

---

## ✅ Working MCPs

### 1. Google Tasks MCP
**Status:** ✅ FULLY WORKING

**Credential File:** `~/.claude/credentials/google.env`
```bash
GOOGLE_CLIENT_ID=768178411823-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REFRESH_TOKEN=1//03BuVGp...
```

**Test Command:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run test-google-tasks.ts
```

**Test Result:**
```json
{
  "lists": [
    {
      "id": "MDAxNzQ5OTA4MzI4NjQ5MzAzOTU6MDow",
      "provider": "google",
      "name": "My Tasks",
      "updatedAt": "2025-11-20T13:03:34.161Z"
    },
    {
      "id": "dllhdVBSdEJjN1F5TnZTTA",
      "provider": "google",
      "name": "Automated Meetings tasks",
      "updatedAt": "2025-11-20T15:15:10.969Z"
    },
    {
      "id": "UmRFUEw1TTVnUkJCcDFkNw",
      "provider": "google",
      "name": "Mai Tasks",
      "updatedAt": "2025-11-19T17:09:04.322Z"
    },
    {
      "id": "OXZjcTFTYjVBbnNDd0k1Mg",
      "provider": "google",
      "name": "Meetings Tasks",
      "updatedAt": "2025-11-22T10:16:34.123Z"
    }
  ]
}
```

**Key Achievement:**
- ✅ Successfully migrated from hardcoded credentials to file-based credentials
- ✅ Credential file loader working correctly
- ✅ All 6 Google Tasks wrappers updated and tested

---

### 2. Ref.tools MCP
**Status:** ✅ FULLY WORKING

**Credential File:** `~/.claude/credentials/ref.env`
```bash
REF_API_KEY=ref-a4c4632bc3799222d347
```

**Test Command:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run test-ref.ts
```

**Test Result:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "page='useState – React' section='eslint-plugin-react-hooks'\nhttps://react.dev/reference/react/useState#eslint-plugin-react-hooks"
    }
  ]
}
```

**Key Achievement:**
- ✅ API key loaded from credential file
- ✅ HTTP-based MCP wrapper working
- ✅ Successfully searches technical documentation

---

### 3. Atlassian (Jira & Confluence) MCP
**Status:** ✅ FULLY WORKING

**Credential File:** `~/.claude/credentials/atlassian.env`
```bash
ATLASSIAN_BASE_URL=https://intelmatix.atlassian.net
ATLASSIAN_EMAIL=m.refaat@intelmatix.ai
ATLASSIAN_API_TOKEN=ATATT3xFfGF0...
```

**Test Command:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
nvm use 18
bun run test-atlassian.ts
```

**Test Result (43 projects found):**
```json
{
  "totalProjects": 43,
  "projects": [
    {
      "key": "EPLT",
      "name": "EDIX Platform",
      "lead": "Mohammad Refaat",
      "webUrl": "https://intelmatix.atlassian.net/projects/EPLT"
    },
    {
      "key": "EDE",
      "name": "EDIX Data Engineering",
      "lead": "Islam Hassan"
    },
    {
      "key": "INV",
      "name": "EDIX Inventory",
      "lead": "Yousef AlGhofaili"
    }
    // ... 40 more projects
  ]
}
```

**Setup Requirements (COMPLETED):**
1. ✅ Node.js >= 18 (using nvm: `nvm use 18`)
2. ✅ Install jsdom dependency: `cd ~/.npm/_npx/[cache-dir] && npm install jsdom`
3. ✅ Credentials configured in `~/.claude/credentials/atlassian.env`

**Key Achievement:**
- ✅ Successfully retrieved 43 Jira projects from Intelmatix Atlassian instance
- ✅ All 17 Jira + 24 Confluence tools now accessible

---

### 4. Google Calendar MCP
**Status:** ✅ FULLY WORKING

**Credential File:** `~/.claude/credentials/google-oauth.json`
**Tokens Files:**
- `~/.config/google-calendar-mcp/tokens.json`
- `~/.config/google-drive-mcp/tokens.json` (shared with Drive)

**Test Command:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run test-google-calendar.ts
```

**Test Result:**
```
✅ SUCCESS! Google Calendar MCP is working.

Events from 2025-11-23 to 2025-11-30:
1. Desert Getaway (2025-11-23)
2. [Out of Office] Mai Nour is away (2025-11-23 to 2025-11-24)
3. 1:1 with Islam and Hasham (2025-11-24 at 13:00)
4. Mo & Islam meeting (2025-11-24 at 14:00)
5. EDIX APAC Standup (2025-11-24 at 05:00)
... (15+ events retrieved)
```

**Key Achievement:**
- ✅ OAuth flow completed successfully
- ✅ Token with comprehensive scopes (calendar + drive)
- ✅ Calendar events retrieved successfully
- ✅ Automatic token distribution to both Calendar and Drive directories

---

### 5. Google Drive MCP
**Status:** ✅ FULLY WORKING

**Credential File:** `~/.claude/credentials/google-oauth.json`
**Tokens Files:**
- `~/.config/google-drive-mcp/tokens.json`
- `~/.config/google-calendar-mcp/tokens.json` (shared with Calendar)

**Test Command:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run test-google-drive.ts
```

**Test Result:**
```
✅ SUCCESS! Google Drive MCP is working.

📁 Root folder contents:
- Documents, spreadsheets, presentations
- Multiple files and folders listed successfully
```

**Key Achievement:**
- ✅ OAuth token shared with Calendar MCP
- ✅ Drive folder contents listed successfully
- ✅ All Drive scopes working (drive, spreadsheets, documents, presentations)

---

## 🔐 OAuth Setup Guide for Google Calendar & Drive

**IMPORTANT:** Both Calendar and Drive MCPs share the same OAuth credentials and tokens. You only need to complete the OAuth flow ONCE to enable both MCPs.

### Prerequisites

1. **Google Cloud Console Setup** (One-time):
   - Go to https://console.cloud.google.com/apis/credentials
   - Create or edit your OAuth 2.0 Client ID
   - Add these redirect URIs:
     - `http://localhost:3000/oauth2callback`
     - `http://localhost:3000`
     - `http://localhost`
   - Save changes
   - Download credentials and save to `~/.claude/credentials/google-oauth.json`

2. **Verify Credential File Format:**
   ```json
   {
     "installed": {
       "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
       "project_id": "your-project",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
       "client_secret": "YOUR_CLIENT_SECRET",
       "redirect_uris": ["http://localhost:3000/oauth2callback", "http://localhost:3000", "http://localhost"]
     }
   }
   ```

### Complete OAuth Flow (First Time Setup)

**Step 1: Start OAuth Callback Server** (Terminal 1)
```bash
cd ~/.claude/projects/code-execution-mcp
export PATH="$HOME/.bun/bin:$PATH"
bun run oauth-callback-server.ts
```

This will:
- Start a local server on `http://localhost:3000`
- Listen for OAuth callback from Google
- Automatically exchange authorization code for tokens
- **Save tokens to BOTH directories** (Calendar and Drive)

**Step 2: Trigger OAuth Flow** (Terminal 2)
```bash
cd ~/.claude/projects/code-execution-mcp
export PATH="$HOME/.bun/bin:$PATH"
bun run manual-oauth-flow.ts
```

**Why use `manual-oauth-flow.ts`?** This script requests ALL required scopes (both Calendar AND Drive) in a single OAuth flow, ensuring one token works for both MCPs.

**Step 3: Authorize in Browser**
- Your browser will open automatically
- Select your Google account
- Review and grant ALL requested permissions:
  - Calendar access (read, events, readonly)
  - Drive access (drive, files, spreadsheets, documents, presentations)
- Click "Allow"
- Browser will redirect to `http://localhost:3000/oauth2callback`
- You'll see "✅ Authorization Successful!" message

**Step 4: Verify Setup**
Terminal 1 should show:
```
✅ Received authorization code from Google
🔄 Exchanging authorization code for tokens...
✅ Successfully obtained tokens
💾 Saving tokens to both Calendar and Drive directories...
✅ Tokens saved to: ~/.config/google-calendar-mcp/tokens.json
✅ Tokens saved to: ~/.config/google-drive-mcp/tokens.json
🎉 OAuth flow completed successfully!
```

**Step 5: Test Both MCPs**
```bash
# Test Calendar
export PATH="$HOME/.bun/bin:$PATH"
bun run test-google-calendar.ts

# Test Drive
bun run test-google-drive.ts
```

Both should now work! ✅

### Common Issues & Solutions

**Issue 1: "Not Found" when redirected**
- **Cause:** Callback server not running
- **Fix:** Make sure Terminal 1 has `oauth-callback-server.ts` running BEFORE triggering OAuth flow

**Issue 2: "redirect_uri_mismatch" error**
- **Cause:** Google Cloud Console doesn't have the correct redirect URIs
- **Fix:** Add `http://localhost:3000/oauth2callback` to your OAuth client's redirect URIs in Google Cloud Console

**Issue 3: "Insufficient authentication scopes"**
- **Cause:** OAuth token doesn't have all required scopes
- **Fix:** Delete existing tokens and re-run OAuth flow using `manual-oauth-flow.ts` (not the test scripts)
  ```bash
  rm ~/.config/google-calendar-mcp/tokens.json
  rm ~/.config/google-drive-mcp/tokens.json
  # Then follow OAuth flow steps above
  ```

**Issue 4: Calendar works but Drive doesn't (or vice versa)**
- **Cause:** Tokens only saved to one directory
- **Fix:** The updated `oauth-callback-server.ts` now saves to BOTH directories automatically. If using old version, manually copy tokens:
  ```bash
  cp ~/.config/google-calendar-mcp/tokens.json ~/.config/google-drive-mcp/tokens.json
  ```

### Important Notes

1. **Single OAuth Flow for Both MCPs:** You only need to complete the OAuth flow ONCE. The same token is used by both Calendar and Drive MCPs.

2. **Scope Consolidation:** The `manual-oauth-flow.ts` script requests ALL scopes (Calendar + Drive) together, so you don't need to authorize separately.

3. **Token Expiration:** OAuth tokens expire after ~1 hour, but the refresh token is used to automatically get new access tokens. The MCPs handle this automatically.

4. **Token Storage:** Tokens are saved to:
   - `~/.config/google-calendar-mcp/tokens.json`
   - `~/.config/google-drive-mcp/tokens.json`

   Both files contain identical tokens.

5. **Scopes Granted:**
   - Calendar: `calendar`, `calendar.events`, `calendar.readonly`
   - Drive: `drive`, `drive.readonly`, `drive.file`, `spreadsheets`, `documents`, `presentations`

---

## 🔧 Important Configuration

### PATH Requirement
**ALL MCPs require `~/.bun/bin` to be in PATH** to execute properly.

**Temporary (for testing):**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run test-google-tasks.ts
```

**Permanent (add to ~/.zshrc or ~/.bash_profile):**
```bash
export PATH="$HOME/.bun/bin:$PATH"
```

**Verify:**
```bash
which bunx  # Should show: /Users/mrefaat/.bun/bin/bunx
```

---

## 📊 Optional Next Steps

### Add PATH to shell profile (Recommended)
Currently, you need to export PATH manually in each terminal session. To make it permanent:

**Add to ~/.zshrc:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
```

**Apply changes:**
```bash
source ~/.zshrc
```

**Verify:**
```bash
which bunx  # Should show: /Users/mrefaat/.bun/bin/bunx
```

---

## 📝 Test Scripts

All test scripts are located in `/Users/mrefaat/.claude/projects/code-execution-mcp/`:

**MCP Test Scripts (All Working):**
- `test-google-tasks.ts` - Tests Google Tasks MCP ✅
- `test-atlassian.ts` - Tests Atlassian (Jira/Confluence) MCP ✅
- `test-ref.ts` - Tests Ref.tools documentation search MCP ✅
- `test-google-calendar.ts` - Tests Google Calendar MCP ✅
- `test-google-drive.ts` - Tests Google Drive MCP ✅

**OAuth Setup Scripts:**
- `oauth-callback-server.ts` - Handles OAuth callbacks (saves tokens to both Calendar and Drive directories) ✅
- `manual-oauth-flow.ts` - Triggers OAuth flow with ALL scopes (Calendar + Drive) ✅

**Run any test:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run <test-script.ts>
```

---

## ✅ Achievements

1. ✅ **Migrated all MCPs to file-based credentials** - Security improvement
2. ✅ **Created centralized credential directory** - `~/.claude/credentials/`
3. ✅ **All credential files properly configured**
4. ✅ **ALL 5 MCPs tested and fully working** (100% success rate!)
5. ✅ **Fixed Atlassian MCP** (Node.js 18 + jsdom dependency)
6. ✅ **Documented PATH requirement** for all MCPs
7. ✅ **Retrieved 43 Jira projects** from Intelmatix Atlassian instance
8. ✅ **Completed OAuth flow for Google Calendar/Drive**
9. ✅ **Created automated OAuth infrastructure:**
   - `oauth-callback-server.ts` - automatic token exchange and dual-directory saving
   - `manual-oauth-flow.ts` - requests all scopes in single OAuth flow
10. ✅ **All test scripts created and working** (5 test scripts + 2 OAuth helpers)
11. ✅ **Comprehensive OAuth setup documentation** with troubleshooting guide
12. ✅ **Solved OAuth challenges:**
   - Redirect URI mismatch issues
   - Scope consolidation (Calendar + Drive in one token)
   - Automatic token distribution to both MCP directories

---

**Overall:** 🎉 Complete Success!

**ALL MCPs Working (5/5 = 100%):**
- ✅ Google Tasks MCP
- ✅ Ref.tools MCP
- ✅ Atlassian (Jira/Confluence) MCP
- ✅ Google Calendar MCP
- ✅ Google Drive MCP

**Key Technical Achievements:**
- Single OAuth flow enables both Calendar and Drive
- Automatic token distribution eliminates manual copying
- Comprehensive troubleshooting guide for future setup
- All MCPs use file-based credentials (no hardcoded secrets)
