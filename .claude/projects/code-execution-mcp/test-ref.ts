#!/usr/bin/env bun

/**
 * Test script for Ref.tools MCP
 * Tests documentation search
 */

import { refSearchDocumentation } from './servers/ref/ref_search_documentation';

async function test() {
  console.log('🧪 Testing Ref.tools MCP with credential file...\n');

  try {
    console.log('📋 Searching documentation for "React hooks"...');
    const result = await refSearchDocumentation({ query: 'React hooks' });

    console.log('\n✅ SUCCESS! Ref.tools MCP is working.');
    console.log('\nResult (first 500 chars):');
    const resultStr = JSON.stringify(result, null, 2);
    console.log(resultStr.substring(0, 500) + '...');

  } catch (error) {
    console.error('\n❌ FAILED! Error testing Ref.tools MCP:');
    console.error(error);
    process.exit(1);
  }
}

test();
