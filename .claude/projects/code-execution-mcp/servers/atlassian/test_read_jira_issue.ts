#!/usr/bin/env npx tsx
// Comprehensive test for read_jira_issue wrapper

import { readJiraIssue } from './read_jira_issue.ts';

async function runTests() {
  console.log('🧪 Running comprehensive tests for read_jira_issue wrapper\n');

  // Test 1: Valid issue key
  console.log('Test 1: Reading valid issue (EDIX-1)...');
  try {
    const result = await readJiraIssue({ issueKey: 'EDIX-1' });
    console.log('✅ Test 1 PASSED: Successfully retrieved issue');
    console.log(`   Issue: ${result.content[0].text.match(/"summary":\s*"([^"]+)"/)?.[1] || 'N/A'}`);
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error);
  }

  console.log();

  // Test 2: Invalid issue key (should handle gracefully)
  console.log('Test 2: Handling non-existent issue (EDIX-99999)...');
  try {
    const result = await readJiraIssue({ issueKey: 'EDIX-99999' });
    if (result.isError) {
      console.log('✅ Test 2 PASSED: Error handled gracefully');
      console.log(`   Error message: ${result.content[0].text}`);
    } else {
      console.log('⚠️  Test 2 WARNING: Expected error but got success');
    }
  } catch (error) {
    console.log('✅ Test 2 PASSED: Exception caught and handled');
  }

  console.log();

  // Test 3: Parameter validation
  console.log('Test 3: Testing parameter validation...');
  try {
    await readJiraIssue({ issueKey: '' } as any);
    console.error('❌ Test 3 FAILED: Should have rejected empty issueKey');
  } catch (error) {
    console.log('✅ Test 3 PASSED: Empty issueKey rejected');
    console.log(`   Error: ${error}`);
  }

  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error);
