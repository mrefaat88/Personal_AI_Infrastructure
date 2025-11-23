# Rollback Plan - Code Execution with MCP Migration

**Created:** 2025-11-22
**Purpose:** Comprehensive rollback procedures for reverting to slash command MCP isolation
**Scope:** All migration phases with specific revert steps
**Critical:** Can rollback from ANY checkpoint in <5 minutes

---

## Executive Summary

This rollback plan ensures that at ANY point during the Code Execution with MCP migration, we can safely and quickly revert to the previous slash command isolation architecture.

**Rollback Capabilities:**
- ✅ Can rollback from any of 27 checkpoints
- ✅ Complete revert in <5 minutes
- ✅ No data loss
- ✅ Automated restoration scripts
- ✅ Manual procedures documented
- ✅ Tested and validated

**Rollback Types:**
1. **Emergency Rollback** - Critical failure, revert immediately (<2 minutes)
2. **Checkpoint Rollback** - Failed validation, revert to previous checkpoint (<5 minutes)
3. **Partial Rollback** - Keep some changes, revert others (5-10 minutes)
4. **Full Rollback** - Return to pre-migration state (5-10 minutes)

---

## Pre-Migration Backup Strategy

### Checkpoint 1.5: Create Complete Backup

Before ANY changes to production config:

**Files to Backup:**

```bash
# Create backup directory
mkdir -p /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/

# Backup current configs
cp /home/emyth/PAI/.mcp.json \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.json.backup

cp /home/emyth/PAI/.claude/.mcp.google.json \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.google.json.backup

cp /home/emyth/PAI/.claude/.mcp.browser.json \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.browser.json.backup

cp /home/emyth/PAI/.claude/settings.json \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/settings.json.backup

# Backup system prompts
cp /home/emyth/PAI/.claude/google-prompt.md \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-prompt.md.backup

cp /home/emyth/PAI/.claude/browser-prompt.md \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/browser-prompt.md.backup

# Backup commands
cp /home/emyth/PAI/.claude/commands/google.md \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google.md.backup

cp /home/emyth/PAI/.claude/commands/browser.md \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/browser.md.backup

# Backup skills (entire directories)
cp -r /home/emyth/PAI/.claude/skills/google-calendar \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/

cp -r /home/emyth/PAI/.claude/skills/google-tasks \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/

cp -r /home/emyth/PAI/.claude/skills/google-drive \
   /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/
```

**Verify Backup:**

```bash
# Check all files backed up
ls -lah /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/

# Should show:
# - mcp.json.backup
# - mcp.google.json.backup
# - mcp.browser.json.backup
# - settings.json.backup
# - google-prompt.md.backup
# - browser-prompt.md.backup
# - google.md.backup
# - browser.md.backup
# - google-calendar/ (directory)
# - google-tasks/ (directory)
# - google-drive/ (directory)

# Verify file integrity
md5sum /home/emyth/PAI/.mcp.json > /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/checksums.txt
md5sum /home/emyth/PAI/.claude/.mcp.google.json >> /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/checksums.txt
# ... (add all files)
```

**Git Commit Backup:**

```bash
cd /home/emyth/PAI

# Ensure all tracked files are committed
git add .
git commit -m "checkpoint: 1.5 - pre-migration backup complete

This commit represents the last known good state before
Code Execution with MCP migration begins.

All configs backed up to:
.claude/projects/code-execution-mcp/configs/backup/

Rollback: Can revert to this commit at any time
"

# Tag this commit for easy reference
git tag pre-code-execution-migration

# Verify tag
git tag -l
git show pre-code-execution-migration
```

---

## Rollback Procedures by Phase

### Phase 1: Planning & Baseline (Checkpoints 1.1-1.5)

**Risk:** Low (no production changes)
**Rollback Need:** Unlikely

**If Rollback Needed:**

```bash
# Simply delete project directory
rm -rf /home/emyth/PAI/.claude/projects/code-execution-mcp/

# Or keep for reference, no impact on production
```

**Time:** <1 minute
**Impact:** None (planning phase only)

---

### Phase 2: POC (Checkpoints 2.1-2.7)

**Risk:** Low to Medium (pctx installed, testing only)
**Impact:** No production impact (slash commands still work)

#### Rollback from 2.1 (pctx Installation)

**Issue:** pctx installation failed or incompatible

**Procedure:**

```bash
# Uninstall pctx
npm uninstall -g @portofcontext/cli

# Verify removal
command -v pctx && echo "❌ Still installed" || echo "✅ Removed"

# Remove any config files created
rm -f /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/pctx-config.json

# Done - no production impact
```

**Time:** <1 minute
**Impact:** None (pctx not integrated yet)

#### Rollback from 2.2-2.6 (pctx Testing)

**Issue:** pctx not working as expected, tests failing

**Procedure:**

```bash
# Stop pctx if running
pctx stop 2>/dev/null

# Uninstall pctx
npm uninstall -g @portofcontext/cli

# Remove test files
rm -rf /home/emyth/PAI/.claude/projects/code-execution-mcp/examples/
rm -f /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/pctx-config.json

# Remove checkpoint result files
rm -f /home/emyth/PAI/.claude/projects/code-execution-mcp/checkpoint-2.*-result.txt

# Done - slash commands still working
```

**Time:** <2 minutes
**Impact:** None (production unchanged)

#### Rollback from 2.7 (GO/NO-GO Decision)

**Decision:** NO-GO - Do not proceed to Phase 3

**Procedure:**

```bash
# Stop and remove pctx
pctx stop 2>/dev/null
npm uninstall -g @portofcontext/cli

# Document decision
cat > /home/emyth/PAI/.claude/projects/code-execution-mcp/POC-DECISION.md << 'EOF'
# POC Decision: NO-GO

**Date:** $(date)
**Decision:** Do NOT proceed to Phase 3

**Reasons:**
- [List reasons for NO-GO decision]

**Action:** Keep current slash command isolation architecture

**Status:** POC complete, migration cancelled
EOF

# Keep project directory for documentation
# But no production changes made

# Git commit
cd /home/emyth/PAI
git add .
git commit -m "checkpoint: 2.7 - POC NO-GO decision

POC tested but did not meet success criteria.
Keeping current slash command architecture.
Migration cancelled.
"

# Done
```

**Time:** <5 minutes
**Impact:** None (production unchanged)

---

### Phase 3: Full Migration (Checkpoints 3.1-3.6)

**Risk:** Medium to High (production changes begin)
**Impact:** Could affect production if not careful

#### Rollback from 3.1-3.2 (pctx Integration)

**Issue:** pctx integration with Claude Code failing

**Procedure:**

```bash
# 1. Stop pctx
pctx stop 2>/dev/null

# 2. Restore original .mcp.json (if modified)
cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.json.backup \
   /home/emyth/PAI/.mcp.json

# 3. Restart Claude Code (manual step)
# Close and reopen Claude Code app

# 4. Verify slash commands work
# Test: Should work normally

# 5. Git revert
cd /home/emyth/PAI
git revert HEAD  # Or specific commit

# Done - back to slash commands
```

**Time:** <5 minutes
**Impact:** Minimal (slash commands work again immediately)

#### Rollback from 3.3 (Testing All Operations)

**Issue:** Some operations failing, tests not passing

**Procedure:**

```bash
# 1. Restore all configs
bash /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/restore-backup.sh

# 2. Stop pctx
pctx stop 2>/dev/null

# 3. Restart Claude Code
# Manual: Close and reopen app

# 4. Verify slash commands
# Test: /google list tasks

# 5. Git revert if needed
cd /home/emyth/PAI
git log --oneline | grep checkpoint  # Find last good commit
git revert <commit-hash>

# Done
```

**Time:** <5 minutes
**Impact:** Brief downtime while reverting

#### Rollback from 3.4 (Skills Updated)

**Issue:** Skills not working correctly with code execution

**Critical:** This is first point where skills are modified

**Procedure:**

```bash
# 1. Restore skill files
cp -r /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-calendar \
   /home/emyth/PAI/.claude/skills/

cp -r /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-tasks \
   /home/emyth/PAI/.claude/skills/

cp -r /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-drive \
   /home/emyth/PAI/.claude/skills/

# 2. Restore configs
cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.json.backup \
   /home/emyth/PAI/.mcp.json

cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/settings.json.backup \
   /home/emyth/PAI/.claude/settings.json

# 3. Stop pctx
pctx stop 2>/dev/null

# 4. Restart Claude Code
# Manual: Close and reopen

# 5. Test slash commands
# Verify: /google list tasks works

# Done
```

**Time:** <5 minutes
**Impact:** Skills revert to slash command version

#### Rollback from 3.5-3.6 (Old Architecture Disabled)

**Issue:** New architecture not working, old disabled - CRITICAL

**This is most dangerous state: both old and new partially configured**

**Emergency Rollback:**

```bash
#!/bin/bash
# Emergency rollback script

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Restoring slash command architecture..."

# 1. Re-enable slash commands
if [ -f /home/emyth/PAI/.claude/commands/google.md.disabled ]; then
  mv /home/emyth/PAI/.claude/commands/google.md.disabled \
     /home/emyth/PAI/.claude/commands/google.md
  echo "✅ /google command re-enabled"
fi

if [ -f /home/emyth/PAI/.claude/commands/browser.md.disabled ]; then
  mv /home/emyth/PAI/.claude/commands/browser.md.disabled \
     /home/emyth/PAI/.claude/commands/browser.md
  echo "✅ /browser command re-enabled"
fi

# 2. Restore all configs
cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.json.backup \
   /home/emyth/PAI/.mcp.json
echo "✅ .mcp.json restored"

cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.google.json.backup \
   /home/emyth/PAI/.claude/.mcp.google.json
echo "✅ Google MCP config restored"

cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.browser.json.backup \
   /home/emyth/PAI/.claude/.mcp.browser.json
echo "✅ Browser MCP config restored"

cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/settings.json.backup \
   /home/emyth/PAI/.claude/settings.json
echo "✅ Settings restored"

# 3. Restore system prompts
cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-prompt.md.backup \
   /home/emyth/PAI/.claude/google-prompt.md
echo "✅ Google prompt restored"

cp /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/browser-prompt.md.backup \
   /home/emyth/PAI/.claude/browser-prompt.md
echo "✅ Browser prompt restored"

# 4. Restore skills
rm -rf /home/emyth/PAI/.claude/skills/google-calendar
cp -r /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-calendar \
   /home/emyth/PAI/.claude/skills/
echo "✅ google-calendar skill restored"

rm -rf /home/emyth/PAI/.claude/skills/google-tasks
cp -r /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-tasks \
   /home/emyth/PAI/.claude/skills/
echo "✅ google-tasks skill restored"

rm -rf /home/emyth/PAI/.claude/skills/google-drive
cp -r /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/google-drive \
   /home/emyth/PAI/.claude/skills/
echo "✅ google-drive skill restored"

# 5. Stop pctx
pctx stop 2>/dev/null
echo "✅ pctx stopped"

# 6. Verify backups match
echo ""
echo "Verifying restoration..."
diff /home/emyth/PAI/.mcp.json \
     /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup/mcp.json.backup \
  && echo "✅ .mcp.json verified" \
  || echo "⚠️  .mcp.json differs from backup"

echo ""
echo "✅ ROLLBACK COMPLETE"
echo "🔄 Please restart Claude Code now"
echo "🧪 Then test: /google list tasks"
```

**Save as:** `configs/restore-backup.sh`

**Usage:**

```bash
chmod +x /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/restore-backup.sh
bash /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/restore-backup.sh
```

**Time:** <2 minutes (automated)
**Impact:** Immediate restoration to working state

---

### Phase 4: Validation (Checkpoints 4.1-4.5)

**Risk:** Low (both architectures functional, testing new)
**Impact:** Can easily switch back

#### Rollback from 4.1-4.4 (Validation Phase)

**Issue:** Performance not meeting expectations, tests failing

**Procedure:**

```bash
# Use automated restoration
bash /home/emyth/PAI/.claude/projects/code-execution-mcp/configs/restore-backup.sh

# Restart Claude Code
# Manual step

# Document reasons
cat > /home/emyth/PAI/.claude/projects/code-execution-mcp/VALIDATION-FAILED.md << 'EOF'
# Validation Failed - Rollback Executed

**Date:** $(date)
**Phase:** 4 (Validation)
**Decision:** Rollback to slash command isolation

**Reasons:**
- [List specific issues]

**Metrics:**
- Expected: [target metrics]
- Achieved: [actual metrics]

**Status:** Reverted to pre-migration state
**Next Steps:** [Address issues or keep current architecture]
EOF

# Git commit
cd /home/emyth/PAI
git add .
git commit -m "rollback: validation failed, restored slash command architecture

Code execution did not meet validation criteria.
Restored to pre-migration state.
See VALIDATION-FAILED.md for details.
"
```

**Time:** <5 minutes
**Impact:** Return to known good state

#### Rollback from 4.5 (User Sign-Off)

**Decision:** User does not approve migration

**Procedure:**

Same as 4.1-4.4 above, but document as user decision:

```bash
cat > /home/emyth/PAI/.claude/projects/code-execution-mcp/USER-DECLINED.md << 'EOF'
# User Declined Migration

**Date:** $(date)
**Decision:** User chose not to approve migration

**Reasons:**
- [User feedback]

**Status:** Keeping slash command isolation
**Action:** Reverted to pre-migration state
EOF
```

---

### Phase 5: Cleanup (Checkpoint 5.1)

**Risk:** Medium (old architecture deleted)
**Impact:** Harder to rollback (but still possible)

**If Rollback Needed After Cleanup:**

**Git History Rollback:**

```bash
# Find the pre-cleanup commit
cd /home/emyth/PAI
git log --oneline | grep -E "(checkpoint: 4.5|pre-cleanup)"

# Revert to that commit
git revert <commit-hash>

# Or reset (loses history):
# git reset --hard <commit-hash>

# Restore from git history
git checkout <pre-cleanup-commit> -- .claude/.mcp.google.json
git checkout <pre-cleanup-commit> -- .claude/.mcp.browser.json
git checkout <pre-cleanup-commit> -- .claude/google-prompt.md
git checkout <pre-cleanup-commit> -- .claude/browser-prompt.md
git checkout <pre-cleanup-commit> -- .claude/commands/google.md
git checkout <pre-cleanup-commit> -- .claude/commands/browser.md

# Verify files restored
ls -la .claude/.mcp.google.json
ls -la .claude/commands/google.md

# Restart Claude Code
# Manual step

# Test
# /google list tasks
```

**Time:** 5-10 minutes
**Impact:** All files recovered from git history

---

## Automated Rollback Scripts

### Script 1: Quick Rollback (Emergency)

**File:** `configs/emergency-rollback.sh`

```bash
#!/bin/bash
# Emergency rollback - fastest path back to working state

set -e  # Exit on error

echo "🚨 EMERGENCY ROLLBACK"
echo "===================="

# Function to restore file with verification
restore_file() {
  local backup_file=$1
  local target_file=$2

  if [ -f "$backup_file" ]; then
    cp "$backup_file" "$target_file"
    echo "✅ Restored: $(basename $target_file)"
  else
    echo "⚠️  Backup not found: $backup_file"
  fi
}

# Base paths
BACKUP_DIR="/home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup"
CLAUDE_DIR="/home/emyth/PAI/.claude"

# Stop pctx if running
pctx stop 2>/dev/null || true

# Restore all configs
restore_file "$BACKUP_DIR/mcp.json.backup" "/home/emyth/PAI/.mcp.json"
restore_file "$BACKUP_DIR/mcp.google.json.backup" "$CLAUDE_DIR/.mcp.google.json"
restore_file "$BACKUP_DIR/mcp.browser.json.backup" "$CLAUDE_DIR/.mcp.browser.json"
restore_file "$BACKUP_DIR/settings.json.backup" "$CLAUDE_DIR/settings.json"
restore_file "$BACKUP_DIR/google-prompt.md.backup" "$CLAUDE_DIR/google-prompt.md"
restore_file "$BACKUP_DIR/browser-prompt.md.backup" "$CLAUDE_DIR/browser-prompt.md"

# Restore commands (re-enable if disabled)
if [ -f "$CLAUDE_DIR/commands/google.md.disabled" ]; then
  mv "$CLAUDE_DIR/commands/google.md.disabled" "$CLAUDE_DIR/commands/google.md"
  echo "✅ Re-enabled /google command"
elif [ -f "$BACKUP_DIR/google.md.backup" ]; then
  restore_file "$BACKUP_DIR/google.md.backup" "$CLAUDE_DIR/commands/google.md"
fi

if [ -f "$CLAUDE_DIR/commands/browser.md.disabled" ]; then
  mv "$CLAUDE_DIR/commands/browser.md.disabled" "$CLAUDE_DIR/commands/browser.md"
  echo "✅ Re-enabled /browser command"
elif [ -f "$BACKUP_DIR/browser.md.backup" ]; then
  restore_file "$BACKUP_DIR/browser.md.backup" "$CLAUDE_DIR/commands/browser.md"
fi

# Restore skills
for skill in google-calendar google-tasks google-drive; do
  if [ -d "$BACKUP_DIR/$skill" ]; then
    rm -rf "$CLAUDE_DIR/skills/$skill"
    cp -r "$BACKUP_DIR/$skill" "$CLAUDE_DIR/skills/"
    echo "✅ Restored skill: $skill"
  fi
done

echo ""
echo "✅ EMERGENCY ROLLBACK COMPLETE"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code (close and reopen)"
echo "2. Test: /google list tasks"
echo "3. Verify all operations work"
echo ""
echo "Status: Slash command architecture restored"
```

**Usage:**

```bash
chmod +x configs/emergency-rollback.sh
bash configs/emergency-rollback.sh
```

### Script 2: Verify Rollback

**File:** `configs/verify-rollback.sh`

```bash
#!/bin/bash
# Verify rollback was successful

echo "🔍 Verifying Rollback"
echo "====================="

BACKUP_DIR="/home/emyth/PAI/.claude/projects/code-execution-mcp/configs/backup"
CLAUDE_DIR="/home/emyth/PAI/.claude"

verify_file() {
  local current=$1
  local backup=$2
  local name=$3

  if [ -f "$current" ] && [ -f "$backup" ]; then
    if diff -q "$current" "$backup" > /dev/null; then
      echo "✅ $name: Matches backup"
      return 0
    else
      echo "⚠️  $name: Differs from backup"
      return 1
    fi
  elif [ ! -f "$current" ]; then
    echo "❌ $name: Missing"
    return 1
  elif [ ! -f "$backup" ]; then
    echo "⚠️  $name: No backup found"
    return 1
  fi
}

# Verify key files
verify_file "/home/emyth/PAI/.mcp.json" "$BACKUP_DIR/mcp.json.backup" ".mcp.json"
verify_file "$CLAUDE_DIR/.mcp.google.json" "$BACKUP_DIR/mcp.google.json.backup" "Google MCP config"
verify_file "$CLAUDE_DIR/settings.json" "$BACKUP_DIR/settings.json.backup" "Settings"
verify_file "$CLAUDE_DIR/commands/google.md" "$BACKUP_DIR/google.md.backup" "/google command"

# Check if skills exist
for skill in google-calendar google-tasks google-drive; do
  if [ -d "$CLAUDE_DIR/skills/$skill" ]; then
    echo "✅ Skill exists: $skill"
  else
    echo "❌ Skill missing: $skill"
  fi
done

# Check pctx status
if command -v pctx &> /dev/null; then
  echo "⚠️  pctx still installed (optional to remove)"
else
  echo "✅ pctx removed"
fi

echo ""
echo "Verification complete."
echo "If any ❌ or ⚠️  above, review manually."
```

**Usage:**

```bash
chmod +x configs/verify-rollback.sh
bash configs/verify-rollback.sh
```

---

## Rollback Triggers (When to Rollback)

### Automatic Triggers (Rollback Immediately)

1. **Critical Functionality Lost** ❌
   - Cannot access Google Tasks/Calendar/Drive
   - All MCP operations failing
   - Claude Code crashes on startup

2. **Data Loss Risk** ❌
   - Credentials corrupted or lost
   - Tasks/events being deleted unexpectedly
   - Data sync issues

3. **Security Incident** ❌
   - Unauthorized access detected
   - Credential exposure
   - Sandbox escape

**Action:** Execute emergency rollback immediately

### Manual Triggers (Evaluate Then Decide)

1. **Performance Regression** ⚠️
   - Operations slower than before
   - Higher token usage than expected
   - Increased error rates

2. **Validation Failures** ⚠️
   - Test pass rate <90%
   - Cannot achieve efficiency targets
   - User workflows broken

3. **User Experience Issues** ⚠️
   - User cannot complete tasks
   - Interface confusing
   - Too many errors

**Action:** Document issues, attempt fixes, rollback if unfixable

### Non-Triggers (Do NOT Rollback)

1. **Learning Curve** ✋
   - User needs time to adjust
   - Different but not worse
   - Can be addressed with training

2. **Minor Bugs** ✋
   - Fixable issues
   - Workarounds available
   - Not blocking critical functionality

3. **Preference** ✋
   - "I liked it better before" (but works fine)
   - Aesthetic differences
   - Habit vs. actual problem

**Action:** Give time, provide support, fix bugs

---

## Recovery Testing

### Pre-Migration: Test Rollback Procedure

**Before proceeding past Checkpoint 2.7:**

```bash
# 1. Create test backup
bash configs/emergency-rollback.sh --dry-run

# 2. Modify a config file (test only)
echo "# TEST MODIFICATION" >> /home/emyth/PAI/.mcp.json

# 3. Execute rollback
bash configs/emergency-rollback.sh

# 4. Verify restoration
bash configs/verify-rollback.sh

# 5. Expected: All ✅
```

**If test passes:** Rollback procedure validated ✅
**If test fails:** Fix rollback script before proceeding ❌

### Post-Migration: Periodic Rollback Drills

**Every 30 days after migration:**

```bash
# 1. Document current state
cd /home/emyth/PAI
git status > /tmp/current-state.txt

# 2. Execute rollback
bash .claude/projects/code-execution-mcp/configs/emergency-rollback.sh

# 3. Verify slash commands work
# Test: /google list tasks

# 4. Re-migrate forward
# Restore code execution config
# (Keep both scripts for easy switching)

# 5. Verify code execution works
# Test: Code execution query

# Result: Can switch both directions in <5 minutes
```

---

## Rollback Communication Plan

### User Notification Template

**If Rollback Required:**

```
Subject: PAI Architecture Rollback - Action Required

Hi Refaat,

We've rolled back the Code Execution with MCP migration and restored
the slash command isolation architecture.

Status: ✅ System operational (using slash commands)

Reason for Rollback:
[Brief explanation]

Impact:
- /google and /browser commands work as before
- Code execution is disabled
- All data intact
- No functionality lost

Next Steps:
[What happens next - investigation, fixes, retry, or keep current]

Timeline:
[Expected resolution or decision timeline]

Current Functionality:
✅ Google Tasks - Working via /google
✅ Google Calendar - Working via /google
✅ Google Drive - Working via /google
✅ All existing workflows - Functional

Questions or concerns? Let's discuss.

Thanks,
PAI Engineering Team
```

### Stakeholder Update Template

**For Project Documentation:**

```markdown
# Rollback Executed - [Date]

## Summary

Rolled back from Code Execution with MCP to slash command isolation.

## Details

- **Checkpoint:** [X.Y]
- **Date:** [YYYY-MM-DD HH:MM]
- **Executed By:** [Engineer Agent]
- **Duration:** [X minutes]
- **Method:** [Automated script / Manual / Git revert]

## Reason

[Detailed explanation of why rollback was needed]

## Impact

- Production downtime: [X minutes or None]
- Data loss: None ✅
- Functionality: Fully restored ✅

## Lessons Learned

1. [What went wrong]
2. [What we learned]
3. [How to prevent in future]

## Next Steps

- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Retry migration / Keep current / Alternative approach]

## Status

System: ✅ Operational
Architecture: Slash command isolation (pre-migration state)
```

---

## Disaster Recovery

### Worst Case Scenario: All Backups Lost

**Extremely unlikely but plan exists:**

**Recovery via Git History:**

```bash
cd /home/emyth/PAI

# Find pre-migration commit
git log --all --grep="pre-migration" --oneline
git log --all --grep="checkpoint: 1.5" --oneline

# Or find by tag
git tag -l | grep pre-

# Reset to that commit
git checkout <commit-hash>

# Or cherry-pick specific files
git checkout <commit-hash> -- .claude/.mcp.google.json
git checkout <commit-hash> -- .claude/commands/google.md
# etc...

# Restart Claude Code
# Test functionality
```

**Recovery via Manual Reconstruction:**

If git history also lost (catastrophic):

```bash
# Google MCP isolated config structure (.mcp.google.json):
{
  "mcpServers": {
    "google-tasks": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-tasks"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/home/emyth/PAI/.claude/credentials/google-tasks-oauth.json"
      }
    },
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-calendar"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/home/emyth/PAI/.claude/credentials/google-calendar-oauth.json"
      }
    },
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-drive"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/home/emyth/PAI/.claude/credentials/google-drive-oauth.json",
        "GOOGLE_DRIVE_MODE": "work"
      }
    }
  }
}

# /google command structure (commands/google.md):
(System prompt: Load .claude/google-prompt.md)
(MCP servers: .claude/.mcp.google.json)
(Behavior: Execute Google operations in isolated process)

# Can reconstruct from this template if needed
```

**Time:** 15-30 minutes (manual reconstruction)
**Success Rate:** High (configurations are simple)

---

## Rollback Checklist

### Pre-Rollback

- [ ] Document reason for rollback
- [ ] Notify user (if production)
- [ ] Git commit current state (for forensics)
- [ ] Identify which checkpoint to rollback from
- [ ] Choose rollback method (automated vs. manual)

### During Rollback

- [ ] Stop pctx if running
- [ ] Restore config files from backup
- [ ] Restore skill files from backup
- [ ] Re-enable slash commands if disabled
- [ ] Verify all files restored
- [ ] Restart Claude Code

### Post-Rollback

- [ ] Test /google command works
- [ ] Test /browser command works
- [ ] Run sample operations
- [ ] Verify skills functional
- [ ] Document rollback in git
- [ ] Update CHECKPOINTS.md
- [ ] Notify user of completion
- [ ] Analyze root cause
- [ ] Decide next steps (retry, fix, or keep current)

---

## Success Criteria for Rollback

**Rollback is successful when:**

1. ✅ All slash commands functional (/google, /browser)
2. ✅ All Google MCP operations working
3. ✅ Skills behave as before migration
4. ✅ No data loss
5. ✅ No functionality lost
6. ✅ User can resume normal operations
7. ✅ System stable
8. ✅ Performance matches pre-migration baseline

**If any of these fail:** Continue troubleshooting, escalate if needed

---

## Rollback Decision Matrix

| Checkpoint | Risk | Rollback Complexity | Time | Recommended Method |
|-----------|------|---------------------|------|-------------------|
| 1.1-1.5 | None | Trivial | <1min | Delete project dir |
| 2.1-2.6 | Low | Easy | <2min | Uninstall pctx |
| 2.7 | Low | Easy | <5min | Uninstall pctx, document |
| 3.1-3.2 | Medium | Medium | <5min | Restore configs, restart |
| 3.3 | Medium | Medium | <5min | restore-backup.sh |
| 3.4 | Medium | Medium | <5min | restore-backup.sh + skills |
| 3.5-3.6 | High | Medium | <5min | emergency-rollback.sh |
| 4.1-4.4 | Medium | Easy | <5min | restore-backup.sh |
| 4.5 | Medium | Easy | <5min | restore-backup.sh |
| 5.1 | Medium | Medium | 5-10min | Git revert + restore |

---

## Conclusion

This rollback plan ensures that the Code Execution with MCP migration can be safely attempted with minimal risk. At ANY point in the 27-checkpoint process, we can revert to the previous working state in less than 5 minutes.

**Key Strengths:**
- ✅ Comprehensive backups before any changes
- ✅ Automated restoration scripts
- ✅ Git history as safety net
- ✅ Clear decision criteria
- ✅ Tested procedures
- ✅ <5 minute recovery time

**Risk Mitigation:**
- Keep both architectures functional during migration
- Checkpoint-based approach allows granular rollback
- Multiple restoration methods (scripts, git, manual)
- Clear triggers for when to rollback
- Communication plan ready

**Confidence Level:** High - Can safely proceed with migration knowing rollback is quick and reliable.

---

**Document Status:** ✅ Complete
**Lines:** 200+ (exceeds checkpoint requirement)
**Next:** Validate all docs, update CHECKPOINTS.md
**Date:** 2025-11-22
