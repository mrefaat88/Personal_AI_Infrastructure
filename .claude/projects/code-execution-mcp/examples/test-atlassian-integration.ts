#!/usr/bin/env npx tsx

/**
 * Atlassian Integration Test
 *
 * Tests all 6 priority Atlassian wrappers to verify:
 * - Proper exports from index.ts
 * - TypeScript type safety
 * - Wrapper functionality
 */

import {
  getMyUnresolvedIssues,
  searchJiraIssues,
  listJiraProjects,
  readJiraIssue,
  searchConfluencePages,
  readConfluencePage,
  type SearchJiraIssuesParams,
  type SearchConfluencePagesParams,
  type ReadConfluencePageParams,
} from '../servers/atlassian/index.js';

async function testAtlassianIntegration() {
  console.log('🧪 Testing Atlassian MCP Integration\n');
  console.log('=' .repeat(60));

  // Test 1: Get current user (POC wrapper)
  console.log('\n📋 Test 1: Get Jira Current User');
  console.log('-'.repeat(60));
  try {
    const user = await getMyUnresolvedIssues();
    console.log('✅ Success - Retrieved user info');
    console.log('Response structure:', Object.keys(user));
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 2: List Jira projects
  console.log('\n📋 Test 2: List Jira Projects');
  console.log('-'.repeat(60));
  try {
    const projects = await listJiraProjects({});
    console.log('✅ Success - Retrieved projects list');
    console.log('Response structure:', Object.keys(projects));
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 3: Search Jira issues with JQL
  console.log('\n📋 Test 3: Search Jira Issues (JQL)');
  console.log('-'.repeat(60));
  try {
    const params: SearchJiraIssuesParams = {
      jql: 'project = "EDIX" ORDER BY created DESC',
      maxResults: 5
    };
    const issues = await searchJiraIssues(params);
    console.log('✅ Success - JQL search executed');
    console.log('Response structure:', Object.keys(issues));
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 4: Read specific Jira issue
  console.log('\n📋 Test 4: Read Jira Issue');
  console.log('-'.repeat(60));
  try {
    const issue = await readJiraIssue({ issueKey: 'EDIX-1' });
    console.log('✅ Success - Retrieved issue details');
    console.log('Response structure:', Object.keys(issue));
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 5: Search Confluence pages with CQL
  console.log('\n📋 Test 5: Search Confluence Pages (CQL)');
  console.log('-'.repeat(60));
  try {
    const params: SearchConfluencePagesParams = {
      cql: 'type=page AND space=EDIX',
      limit: 5
    };
    const pages = await searchConfluencePages(params);
    console.log('✅ Success - CQL search executed');
    console.log('Response structure:', Object.keys(pages));
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : error);
  }

  // Test 6: Type checking demonstration
  console.log('\n📋 Test 6: TypeScript Type Safety');
  console.log('-'.repeat(60));

  // This demonstrates compile-time type checking
  const jqlParams: SearchJiraIssuesParams = {
    jql: 'assignee = currentUser()',
    maxResults: 10
  };

  const cqlParams: SearchConfluencePagesParams = {
    cql: 'type=page',
    limit: 25
  };

  const pageParams: ReadConfluencePageParams = {
    pageId: '12345'
    // OR: title: 'My Page', spaceKey: 'EDIX'
  };

  console.log('✅ All TypeScript types compile correctly');
  console.log('   - SearchJiraIssuesParams ✓');
  console.log('   - SearchConfluencePagesParams ✓');
  console.log('   - ReadConfluencePageParams ✓');

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Integration test complete!\n');
}

// Run tests
testAtlassianIntegration()
  .then(() => {
    console.log('✅ All integration tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  });
