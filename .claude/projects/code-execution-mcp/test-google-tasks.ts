#!/usr/bin/env bun

/**
 * Test script for Google Tasks MCP
 * Tests the credential file integration
 */

import { listTaskLists } from './servers/google-tasks/list_task_lists';

async function test() {
  console.log('🧪 Testing Google Tasks MCP with credential file...\n');

  try {
    console.log('📋 Fetching task lists...');
    const result = await listTaskLists();

    console.log('\n✅ SUCCESS! Google Tasks MCP is working.');
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ FAILED! Error testing Google Tasks MCP:');
    console.error(error);
    process.exit(1);
  }
}

test();
