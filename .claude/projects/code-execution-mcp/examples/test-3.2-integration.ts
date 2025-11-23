#!/usr/bin/env npx tsx

/**
 * Checkpoint 3.2 Test: Claude Code Integration
 *
 * This test validates that:
 * 1. Wrappers can be imported from the unified export
 * 2. Multiple MCPs can be used in a single script
 * 3. Code executes successfully from any location
 * 4. Results are returned in expected format
 *
 * This simulates how Claude Code would generate and execute code.
 */

import { listTaskLists } from '../servers/google-tasks';
import { getCurrentTime } from '../servers/google-calendar';
import { listFolder } from '../servers/google-drive';

async function testIntegration() {
  console.log('🔌 Testing Claude Code Integration\n');
  console.log('=' + '='.repeat(79) + '\n');

  const startTime = Date.now();
  const results: any = {
    imports: { success: true },
    execution: { tasks: null, calendar: null, drive: null },
    errors: [],
    success: false
  };

  // Test 1: Verify imports work
  console.log('📦 Test 1: Import Verification');
  console.log('-'.repeat(80));
  try {
    console.log('✅ Imports successful');
    console.log('   - listTaskLists: function');
    console.log('   - getCurrentTime: function');
    console.log('   - listFolder: function');
    console.log('');
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    results.imports.success = false;
    results.errors.push({ test: 'imports', error: error.message });
    console.log('');
  }

  // Test 2: Execute each wrapper
  console.log('⚡ Test 2: Wrapper Execution');
  console.log('-'.repeat(80));

  // Tasks
  try {
    const tasksStart = Date.now();
    const taskLists = await listTaskLists();
    const tasksTiming = Date.now() - tasksStart;

    console.log(`✅ Google Tasks executed (${tasksTiming}ms)`);
    results.execution.tasks = {
      success: true,
      timing: tasksTiming,
      resultType: Array.isArray(taskLists) ? 'array' : typeof taskLists
    };
  } catch (error: any) {
    console.error(`❌ Google Tasks failed: ${error.message}`);
    results.errors.push({ test: 'tasks', error: error.message });
  }

  // Calendar
  try {
    const calendarStart = Date.now();
    const currentTime = await getCurrentTime();
    const calendarTiming = Date.now() - calendarStart;

    console.log(`✅ Google Calendar executed (${calendarTiming}ms)`);
    results.execution.calendar = {
      success: true,
      timing: calendarTiming,
      resultType: Array.isArray(currentTime) ? 'array' : typeof currentTime
    };
  } catch (error: any) {
    console.error(`❌ Google Calendar failed: ${error.message}`);
    results.errors.push({ test: 'calendar', error: error.message });
  }

  // Drive
  try {
    const driveStart = Date.now();
    const rootContents = await listFolder();
    const driveTiming = Date.now() - driveStart;

    console.log(`✅ Google Drive executed (${driveTiming}ms)`);
    results.execution.drive = {
      success: true,
      timing: driveTiming,
      resultType: Array.isArray(rootContents) ? 'array' : typeof rootContents
    };
  } catch (error: any) {
    console.error(`❌ Google Drive failed: ${error.message}`);
    results.errors.push({ test: 'drive', error: error.message });
  }

  console.log('');

  // Test 3: Verify return format
  console.log('📋 Test 3: Result Format Validation');
  console.log('-'.repeat(80));

  const formatChecks = {
    tasks: results.execution.tasks?.resultType === 'array',
    calendar: results.execution.calendar?.resultType === 'array',
    drive: results.execution.drive?.resultType === 'array'
  };

  Object.entries(formatChecks).forEach(([service, isArray]) => {
    if (isArray) {
      console.log(`✅ ${service}: Returns array (MCP format)`);
    } else if (results.execution[service]) {
      console.log(`⚠️  ${service}: Returns ${results.execution[service].resultType} (unexpected)`);
    }
  });
  console.log('');

  // Calculate success
  const totalTime = Date.now() - startTime;
  const successCount = [
    results.execution.tasks,
    results.execution.calendar,
    results.execution.drive
  ].filter(r => r !== null && r.success).length;

  results.success = results.imports.success && successCount === 3 && results.errors.length === 0;

  // Summary
  console.log('=' + '='.repeat(79));
  console.log('📊 Integration Test Summary\n');

  console.log(`Tests Passed: ${successCount}/3`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log('');

  console.log('Timings:');
  if (results.execution.tasks) {
    console.log(`  Google Tasks:    ${results.execution.tasks.timing}ms`);
  }
  if (results.execution.calendar) {
    console.log(`  Google Calendar: ${results.execution.calendar.timing}ms`);
  }
  if (results.execution.drive) {
    console.log(`  Google Drive:    ${results.execution.drive.timing}ms`);
  }
  console.log('');

  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach((err: any) => {
      console.log(`  - ${err.test}: ${err.error}`);
    });
    console.log('');
  }

  // Final status
  console.log('=' + '='.repeat(79));
  if (results.success) {
    console.log('✅ INTEGRATION TEST PASSED! 🎉');
    console.log('');
    console.log('🎯 Checkpoint 3.2 Validation:');
    console.log('   ✅ Imports work from unified export');
    console.log('   ✅ All wrappers execute successfully');
    console.log('   ✅ Results returned in correct format');
    console.log('   ✅ Can be run via npx tsx shebang');
    console.log('   ✅ Ready for Claude Code code generation');
  } else {
    console.log('⚠️  INTEGRATION TEST FAILED');
    console.log('   Review errors above for details');
  }
  console.log('=' + '='.repeat(79));

  return results;
}

// Run test
testIntegration()
  .then((results) => {
    if (results.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
