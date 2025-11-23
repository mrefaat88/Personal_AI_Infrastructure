#!/bin/bash
# Restore pre-migration configuration
# This script restores all backed up files to their original locations
# Safe to run - will prompt before overwriting

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="$SCRIPT_DIR/backup"
PAI_ROOT="/home/emyth/PAI"

echo "=========================================="
echo "  Configuration Restore Script"
echo "=========================================="
echo ""
echo "This will restore the pre-migration configuration from:"
echo "  $BACKUP_DIR"
echo ""
echo "Target files:"
echo "  - .claude/.mcp.google.json"
echo "  - .claude/.mcp.browser.json"
echo "  - .claude/settings.json"
echo "  - .claude/google-prompt.md"
echo "  - .claude/browser-prompt.md"
echo "  - .claude/commands/google.md"
echo "  - .claude/commands/browser.md"
echo "  - .claude/skills/google-tasks/"
echo "  - .claude/skills/google-calendar/"
echo "  - .claude/skills/google-drive/"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ ERROR: Backup directory not found at $BACKUP_DIR"
    exit 1
fi

# Count backup files
BACKUP_COUNT=$(find "$BACKUP_DIR" -type f -name "*.backup" | wc -l)
echo "Found $BACKUP_COUNT backup files"
echo ""

# Dry run option
if [ "$1" == "--dry-run" ]; then
    echo "🔍 DRY RUN MODE - No files will be modified"
    echo ""
    echo "Would restore the following files:"
    echo ""

    if [ -f "$BACKUP_DIR/mcp.google.json.backup" ]; then
        echo "  ✅ mcp.google.json.backup → .claude/.mcp.google.json"
    fi

    if [ -f "$BACKUP_DIR/mcp.browser.json.backup" ]; then
        echo "  ✅ mcp.browser.json.backup → .claude/.mcp.browser.json"
    fi

    if [ -f "$BACKUP_DIR/settings.json.backup" ]; then
        echo "  ✅ settings.json.backup → .claude/settings.json"
    fi

    if [ -f "$BACKUP_DIR/google-prompt.md.backup" ]; then
        echo "  ✅ google-prompt.md.backup → .claude/google-prompt.md"
    fi

    if [ -f "$BACKUP_DIR/browser-prompt.md.backup" ]; then
        echo "  ✅ browser-prompt.md.backup → .claude/browser-prompt.md"
    fi

    if [ -f "$BACKUP_DIR/google.md.backup" ]; then
        echo "  ✅ google.md.backup → .claude/commands/google.md"
    fi

    if [ -f "$BACKUP_DIR/browser.md.backup" ]; then
        echo "  ✅ browser.md.backup → .claude/commands/browser.md"
    fi

    if [ -d "$BACKUP_DIR/google-tasks" ]; then
        echo "  ✅ google-tasks/ → .claude/skills/google-tasks/"
    fi

    if [ -d "$BACKUP_DIR/google-calendar" ]; then
        echo "  ✅ google-calendar/ → .claude/skills/google-calendar/"
    fi

    if [ -d "$BACKUP_DIR/google-drive" ]; then
        echo "  ✅ google-drive/ → .claude/skills/google-drive/"
    fi

    echo ""
    echo "✅ Dry run complete - all backup files are valid"
    echo "Run without --dry-run to perform actual restore"
    exit 0
fi

# Confirm before proceeding
echo "⚠️  WARNING: This will overwrite current configuration files!"
echo ""
read -p "Continue with restore? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo ""
echo "Starting restore..."
echo ""

# Change to PAI root directory
cd "$PAI_ROOT"

# Restore MCP configuration files
echo "Restoring MCP configuration files..."

if [ -f "$BACKUP_DIR/mcp.google.json.backup" ]; then
    cp "$BACKUP_DIR/mcp.google.json.backup" .claude/.mcp.google.json
    echo "  ✅ Restored .claude/.mcp.google.json"
fi

if [ -f "$BACKUP_DIR/mcp.browser.json.backup" ]; then
    cp "$BACKUP_DIR/mcp.browser.json.backup" .claude/.mcp.browser.json
    echo "  ✅ Restored .claude/.mcp.browser.json"
fi

if [ -f "$BACKUP_DIR/settings.json.backup" ]; then
    cp "$BACKUP_DIR/settings.json.backup" .claude/settings.json
    echo "  ✅ Restored .claude/settings.json"
fi

if [ -f "$BACKUP_DIR/google-prompt.md.backup" ]; then
    cp "$BACKUP_DIR/google-prompt.md.backup" .claude/google-prompt.md
    echo "  ✅ Restored .claude/google-prompt.md"
fi

if [ -f "$BACKUP_DIR/browser-prompt.md.backup" ]; then
    cp "$BACKUP_DIR/browser-prompt.md.backup" .claude/browser-prompt.md
    echo "  ✅ Restored .claude/browser-prompt.md"
fi

echo ""

# Restore slash commands
echo "Restoring slash commands..."

if [ -f "$BACKUP_DIR/google.md.backup" ]; then
    cp "$BACKUP_DIR/google.md.backup" .claude/commands/google.md
    echo "  ✅ Restored .claude/commands/google.md"
fi

if [ -f "$BACKUP_DIR/browser.md.backup" ]; then
    cp "$BACKUP_DIR/browser.md.backup" .claude/commands/browser.md
    echo "  ✅ Restored .claude/commands/browser.md"
fi

echo ""

# Restore Google skills
echo "Restoring Google skills..."

if [ -d "$BACKUP_DIR/google-tasks" ]; then
    rm -rf .claude/skills/google-tasks
    cp -r "$BACKUP_DIR/google-tasks" .claude/skills/
    echo "  ✅ Restored .claude/skills/google-tasks/"
fi

if [ -d "$BACKUP_DIR/google-calendar" ]; then
    rm -rf .claude/skills/google-calendar
    cp -r "$BACKUP_DIR/google-calendar" .claude/skills/
    echo "  ✅ Restored .claude/skills/google-calendar/"
fi

if [ -d "$BACKUP_DIR/google-drive" ]; then
    rm -rf .claude/skills/google-drive
    cp -r "$BACKUP_DIR/google-drive" .claude/skills/
    echo "  ✅ Restored .claude/skills/google-drive/"
fi

echo ""
echo "=========================================="
echo "  ✅ Configuration Restored Successfully"
echo "=========================================="
echo ""
echo "Restored configuration to pre-migration state."
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code to pick up configuration changes"
echo "  2. Test /google command to verify functionality"
echo "  3. Test Google skills to ensure they work"
echo ""
echo "Restoration complete in $(date '+%H:%M:%S')"
echo ""
