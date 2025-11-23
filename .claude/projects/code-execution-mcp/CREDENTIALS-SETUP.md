# MCP Credentials Setup Guide

**Created:** 2025-11-22
**Purpose:** Complete guide for setting up credentials for all 5 MCPs

---

## 🎯 Quick Summary

| MCP | Status | Location | Action Required |
|-----|--------|----------|-----------------|
| **Google Tasks** | ✅ Ready | Hardcoded in wrappers | None - works immediately |
| **Google Calendar** | ⚠️ Optional | `~/.env` or hardcoded | Optional OAuth file |
| **Google Drive** | ⚠️ Optional | `~/.env` or hardcoded | Optional OAuth file |
| **Atlassian** | ⚠️ **REQUIRED** | `~/.claude/credentials/atlassian.env` | **ADD YOUR API TOKEN** |
| **Ref.tools** | ⚠️ Required if using | `~/.claude/credentials/ref.env` | **ADD YOUR API KEY** |

---

## 📍 Where to Put Credentials

### Directory Structure
```
~/.claude/credentials/          # Main credentials directory
├── README.md                   # Credentials documentation
├── atlassian.env               # ⚠️ EDIT: Add your API token
├── ref.env                     # ⚠️ EDIT: Add your API key
├── google-calendar-oauth.json  # Optional: OAuth tokens
└── google-drive-work-oauth.json # Optional: OAuth tokens
```

---

## 1️⃣ Google Tasks (Priority: Low - Already Working)

### Status: ✅ WORKS OUT OF THE BOX

**Hardcoded credentials in wrappers:**
```typescript
GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET: 'GOCSPX-YOUR_CLIENT_SECRET'
GOOGLE_REFRESH_TOKEN: '1//YOUR_REFRESH_TOKEN'
```

### Test It Works:
```bash
# Just use in conversation:
"Show me my task lists"
"What tasks do I have"
```

### Optional Override (if you want your own credentials):
Add to `~/.env`:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

---

## 2️⃣ Google Calendar (Priority: Low - Optional)

### Status: ⚠️ Uses fallback, may need OAuth file

**Current behavior:**
- Tries `process.env.GOOGLE_OAUTH_CREDENTIALS`
- Falls back to: `~/.claude/credentials/google-calendar-oauth.json`

### If You Need It:
1. Go to https://console.cloud.google.com/
2. Create OAuth 2.0 credentials
3. Download credentials JSON
4. Save as: `~/.claude/credentials/google-calendar-oauth.json`

**JSON Format:**
```json
{
  "installed": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "client_secret": "your-client-secret",
    "redirect_uris": ["http://localhost"]
  },
  "tokens": {
    "access_token": "ya29.xxx",
    "refresh_token": "1//xxx",
    "expiry_date": 1234567890123
  }
}
```

---

## 3️⃣ Google Drive (Priority: Low - Optional)

### Status: ⚠️ Uses fallback, may need OAuth file

**Same as Google Calendar:**
- Save OAuth JSON to: `~/.claude/credentials/google-drive-work-oauth.json`
- Same format as Calendar above

---

## 4️⃣ Atlassian (Jira & Confluence) (Priority: HIGH - Work Critical)

### Status: ⚠️ **REQUIRED FOR WORK**

**File:** `~/.claude/credentials/atlassian.env`
**Template already created** - just add your token

### 🚨 SETUP STEPS (DO THIS NOW):

#### Step 1: Generate API Token
```bash
# Open this URL in browser:
https://id.atlassian.com/manage-profile/security/api-tokens

# Click "Create API token"
# Label: "Claude Code MCP Integration"
# Copy the token (you won't see it again!)
```

#### Step 2: Edit Credentials File
```bash
nano ~/.claude/credentials/atlassian.env
```

**Replace `<your-api-token>` with your actual token:**
```bash
ATLASSIAN_BASE_URL=https://intelmatix.atlassian.net
ATLASSIAN_EMAIL=m.refaat@intelmatix.ai
ATLASSIAN_API_TOKEN=ATATT3xFfGF0...  # Your actual token here
```

#### Step 3: Save and Test
```bash
# Save file (Ctrl+X, Y, Enter in nano)

# Test it works:
bunx tsx ~/.claude/projects/code-execution-mcp/servers/atlassian/list_jira_projects.ts
```

**Expected output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"projects\":[{\"key\":\"EDIX\",\"name\":\"EDIX Platform\", ...}]}"
    }
  ]
}
```

### Or test in conversation:
```
"Show me all Jira projects"
"List my open issues"
"Search for bugs in EDIX project"
```

---

## 5️⃣ Ref.tools (Priority: Medium - Optional)

### Status: ⚠️ Required only if using documentation search

**File:** `~/.claude/credentials/ref.env`
**Template already created** - just add your key

### Setup Steps:

#### Step 1: Get API Key
```bash
# Sign up at:
https://ref.tools

# Get API key from dashboard
```

#### Step 2: Edit Credentials File
```bash
nano ~/.claude/credentials/ref.env
```

**Replace `<your-api-key>` with your actual key:**
```bash
REF_API_KEY=ref_xxxxxxxxxxxxx  # Your actual key here
```

#### Step 3: Save and Test
```bash
# Save file

# Test it works:
bunx tsx ~/.claude/projects/code-execution-mcp/servers/ref/ref_search_documentation.ts "React hooks"
```

---

## 🔐 Security Checklist

### ✅ File Permissions (Already Set)
```bash
chmod 600 ~/.claude/credentials/*.env
chmod 600 ~/.claude/credentials/*.json
```

### ✅ Never Commit to Git
The `~/.claude/credentials/` directory should NEVER be in git.

**Verify:**
```bash
# This should show credentials/ in .gitignore:
grep credentials ~/.gitignore
```

### ✅ Rotate Tokens Regularly
- **Atlassian API tokens:** Every 90 days
- **Ref.tools API keys:** As needed
- **Google OAuth:** Auto-refreshed

---

## 🧪 Testing Each MCP

### Google Tasks (Should work immediately)
```bash
# In conversation:
"Show me my task lists"
"Create a task for tomorrow"
```

### Atlassian (After adding API token)
```bash
# In conversation:
"Show me my open Jira issues"
"List all EDIX projects"
"Search for bugs in EDIX"

# Or via CLI:
bunx tsx ~/.claude/projects/code-execution-mcp/servers/atlassian/search_jira_issues.ts
```

### Ref.tools (After adding API key)
```bash
# In conversation:
"Search documentation for React hooks"

# Or via CLI:
bunx tsx ~/.claude/projects/code-execution-mcp/servers/ref/ref_search_documentation.ts "React"
```

---

## 🐛 Troubleshooting

### Error: "ATLASSIAN_API_TOKEN must be set"
**Cause:** API token not in credentials file
**Fix:**
1. Check file exists: `cat ~/.claude/credentials/atlassian.env`
2. Verify token is set (no `<your-api-token>` placeholder)
3. Re-generate token if expired

### Error: "Cannot read credentials file"
**Cause:** File doesn't exist or wrong permissions
**Fix:**
```bash
# Check file exists:
ls -la ~/.claude/credentials/

# Create if missing:
nano ~/.claude/credentials/atlassian.env

# Set permissions:
chmod 600 ~/.claude/credentials/*.env
```

### Error: "Invalid API token"
**Cause:** Token expired or incorrect
**Fix:**
1. Generate new token at https://id.atlassian.com/manage-profile/security/api-tokens
2. Replace old token in `~/.claude/credentials/atlassian.env`

### Google OAuth Errors
**Cause:** OAuth tokens expired
**Fix:**
1. Try without OAuth file first (use hardcoded credentials)
2. If still failing, regenerate OAuth tokens via Google Cloud Console

---

## 📚 Additional Documentation

- **Full Credentials README:** `~/.claude/credentials/README.md`
- **Migration Summary:** `~/.claude/projects/code-execution-mcp/MIGRATION-TO-CURRENT-REPO.md`
- **Integration Guide:** `~/.claude/projects/code-execution-mcp/INTEGRATION-GUIDE.md`
- **Usage Guide:** `~/.claude/projects/code-execution-mcp/USAGE-GUIDE.md`

---

## ✅ Completion Checklist

- [ ] Atlassian API token added to `~/.claude/credentials/atlassian.env`
- [ ] Tested Atlassian: `"Show me my Jira projects"`
- [ ] (Optional) Ref.tools API key added to `~/.claude/credentials/ref.env`
- [ ] (Optional) Google OAuth files created if needed
- [ ] File permissions set: `chmod 600 ~/.claude/credentials/*`
- [ ] Verified credentials directory not in git

---

**Next Steps:** Once Atlassian token is added, all MCPs are ready to use!
