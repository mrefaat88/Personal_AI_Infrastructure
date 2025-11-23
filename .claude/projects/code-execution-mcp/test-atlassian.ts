#!/usr/bin/env bun

/**
 * Test script for Atlassian MCP
 * Tests Jira and Confluence integration
 */

import { listJiraProjects } from './servers/atlassian/list_jira_projects';

async function test() {
  console.log('🧪 Testing Atlassian (Jira) MCP with credential file...\n');

  try {
    console.log('📋 Fetching Jira projects...');
    const result = await listJiraProjects();

    console.log('\n✅ SUCCESS! Atlassian MCP is working.');
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ FAILED! Error testing Atlassian MCP:');
    console.error(error);
    process.exit(1);
  }
}

test();
