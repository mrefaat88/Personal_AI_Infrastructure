#!/usr/bin/env bun

/**
 * Test script for Google Drive MCP
 * Tests the credential file integration
 */

import { listFolder } from './servers/google-drive/listFolder';

async function test() {
  console.log('🧪 Testing Google Drive MCP with credential file...\n');

  try {
    console.log('📋 Listing root folder contents...');
    const result = await listFolder();

    console.log('\n✅ SUCCESS! Google Drive MCP is working.');
    console.log('\nResult (first 500 chars):');
    const resultStr = JSON.stringify(result, null, 2);
    console.log(resultStr.substring(0, 500) + '...');

  } catch (error) {
    console.error('\n❌ FAILED! Error testing Google Drive MCP:');
    console.error(error);
    process.exit(1);
  }
}

test();
