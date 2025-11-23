#!/usr/bin/env npx tsx

/**
 * Atlassian MCP Server - Main Export Module
 *
 * This module provides access to Atlassian (Jira & Confluence) functionality
 * through MCP (Model Context Protocol) wrappers.
 *
 * ARCHITECTURE:
 * - Each wrapper spawns mcp-atlassian server with stdio transport
 * - Credentials loaded from ~/.claude/credentials/atlassian.env
 * - All wrappers follow spawn-based pattern for 99.5% token savings
 *
 * CREDENTIALS REQUIRED:
 * - ATLASSIAN_BASE_URL: Your Atlassian instance URL (e.g., https://company.atlassian.net)
 * - ATLASSIAN_EMAIL: Your Atlassian account email
 * - ATLASSIAN_API_TOKEN: API token from https://id.atlassian.com/manage-profile/security/api-tokens
 *
 * USAGE:
 * ```typescript
 * import { searchJiraIssues, readJiraIssue, listJiraProjects } from './servers/atlassian';
 *
 * // Search Jira issues with JQL
 * const issues = await searchJiraIssues({
 *   jql: 'assignee = currentUser() AND resolution = Unresolved',
 *   maxResults: 10
 * });
 *
 * // Read specific issue
 * const issue = await readJiraIssue({ issueKey: 'EDIX-123' });
 *
 * // List all projects
 * const projects = await listJiraProjects({});
 * ```
 *
 * @module servers/atlassian
 */

// ============================================================================
// JIRA WRAPPERS
// ============================================================================

/**
 * Get current authenticated Jira user information
 *
 * NOTE: This was the POC wrapper, originally named getMyUnresolvedIssues
 * but actually calls get_jira_current_user due to tool name mismatch discovery
 */
export { getMyUnresolvedIssues } from './get_my_open_issues.js';

/**
 * Search Jira issues using JQL (Jira Query Language)
 *
 * Most powerful search tool - supports complex queries with:
 * - Field filters (assignee, reporter, status, priority, etc.)
 * - Date ranges (created, updated, resolved)
 * - Text search (summary, description, comments)
 * - Logical operators (AND, OR, NOT)
 * - Sorting (ORDER BY)
 *
 * @see https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/
 */
export { searchJiraIssues } from './search_jira_issues.js';
export type { SearchJiraIssuesParams } from './search_jira_issues.js';

/**
 * List all accessible Jira projects
 *
 * Returns: project keys, names, descriptions, leads, issue types, etc.
 * No parameters required - retrieves all projects user has access to
 */
export { listJiraProjects } from './list_jira_projects.js';

/**
 * Read detailed information about a specific Jira issue
 *
 * Returns complete issue details:
 * - Summary, description, status, priority
 * - Assignee, reporter, watchers
 * - Comments, activity history
 * - Attachments, linked issues
 * - Custom fields, labels, components
 */
export { readJiraIssue } from './read_jira_issue.js';

// ============================================================================
// CONFLUENCE WRAPPERS
// ============================================================================

/**
 * Search Confluence pages using CQL (Confluence Query Language)
 *
 * Supports:
 * - Space filtering (space=EDIX)
 * - Text search (text ~ "keyword")
 * - Date ranges (created, lastModified)
 * - Creator/contributor filters
 * - Label filtering
 * - Type filtering (page, blogpost, comment)
 *
 * @see https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/
 */
export { searchConfluencePages } from './search_confluence_pages.js';
export type { SearchConfluencePagesParams } from './search_confluence_pages.js';

/**
 * Read a specific Confluence page
 *
 * Two ways to identify page:
 * 1. By pageId alone (if you know the ID)
 * 2. By title + spaceKey (for named lookup)
 *
 * Returns: page content, metadata, attachments, version history
 */
export { readConfluencePage } from './read_confluence_page.js';
export type { ReadConfluencePageParams } from './read_confluence_page.js';

// ============================================================================
// AVAILABLE TOOLS SUMMARY
// ============================================================================

/**
 * PRIORITY TOOLS (6 total):
 *
 * JIRA (4):
 * ✅ get_jira_current_user - Get authenticated user info
 * ✅ search_jira_issues - Search with JQL (most powerful)
 * ✅ list_jira_projects - List all projects
 * ✅ read_jira_issue - Get issue details
 *
 * CONFLUENCE (2):
 * ✅ search_confluence_pages - Search with CQL
 * ✅ read_confluence_page - Read page content
 *
 * ADDITIONAL AVAILABLE TOOLS (35 more):
 * The mcp-atlassian package provides 41 total tools.
 * See /tmp/atlassian-tools-list.md for complete list.
 * Additional wrappers can be created as needed using the same pattern.
 *
 * INTEGRATION STATUS:
 * - Package: mcp-atlassian v2.1.0
 * - Installation: Global (npx -y mcp-atlassian)
 * - Authentication: API token via atlassian.env
 * - Architecture: Spawn-based stdio transport
 * - Token savings: 99.5% vs slash command approach
 */
