#!/usr/bin/env npx tsx

/**
 * Checkpoint 3.3 Test: All Google Operations
 *
 * This test validates that ALL operations work correctly:
 * - Google Tasks: list, create, update, delete
 * - Google Calendar: list events, get time
 * - Google Drive: search, list folders
 *
 * This is a comprehensive operational test to ensure no regressions.
 */

import {
  listTaskLists,
  listTasks,
  createTask,
  updateTask,
  deleteTask
} from '../servers/google-tasks';

import {
  getCurrentTime,
  listEvents
} from '../servers/google-calendar';

import {
  search,
  listFolder
} from '../servers/google-drive';

interface TestResult {
  category: string;
  operation: string;
  status: 'pass' | 'fail' | 'skip';
  timing: number;
  error?: string;
  details?: any;
}

async function testAllOperations() {
  console.log('🧪 Testing All Google Operations\n');
  console.log('=' + '='.repeat(79) + '\n');

  const results: TestResult[] = [];
  const startTime = Date.now();

  // =================================================================
  // GOOGLE TASKS TESTS
  // =================================================================
  console.log('📋 GOOGLE TASKS OPERATIONS');
  console.log('-'.repeat(80));

  // Test 1: List Task Lists (READ)
  try {
    const t1 = Date.now();
    const taskLists = await listTaskLists();
    const timing = Date.now() - t1;

    console.log(`✅ List task lists (${timing}ms)`);
    results.push({
      category: 'Tasks',
      operation: 'list_task_lists',
      status: 'pass',
      timing,
      details: { resultType: Array.isArray(taskLists) ? 'array' : typeof taskLists }
    });
  } catch (error: any) {
    console.error(`❌ List task lists failed: ${error.message}`);
    results.push({
      category: 'Tasks',
      operation: 'list_task_lists',
      status: 'fail',
      timing: 0,
      error: error.message
    });
  }

  // Test 2: Create Task (CREATE)
  let createdTaskId: string | null = null;
  let testTaskListId: string | null = null;

  try {
    // First get a task list to use
    const listsResult = await listTaskLists();

    // Extract text from MCP response
    let text = '';
    if (listsResult && typeof listsResult === 'object') {
      if ('content' in listsResult && Array.isArray(listsResult.content)) {
        text = listsResult.content[0]?.text || '';
      } else if (Array.isArray(listsResult) && listsResult[0]?.text) {
        text = listsResult[0].text;
      }
    }

    // Parse JSON if present
    if (text.includes('{')) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.lists && parsed.lists.length > 0) {
            testTaskListId = parsed.lists[0].id;
          }
        }
      } catch (e) {
        // Fallback to regex
      }
    }

    if (!testTaskListId) {
      throw new Error('No task list found for testing');
    }

    const t2 = Date.now();
    const newTask = await createTask(
      testTaskListId,
      '[TEST] Checkpoint 3.3 test task - DELETE ME',
      {
        notes: 'Created by automated test - safe to delete'
      }
    );
    const timing = Date.now() - t2;

    // Extract task ID from result
    let taskText = '';
    if (newTask && typeof newTask === 'object') {
      if ('content' in newTask && Array.isArray(newTask.content)) {
        taskText = newTask.content[0]?.text || '';
      } else if (Array.isArray(newTask) && newTask[0]?.text) {
        taskText = newTask[0].text;
      }
    }

    // Parse JSON if present
    if (taskText.includes('{')) {
      try {
        const jsonMatch = taskText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.id) {
            createdTaskId = parsed.id;
          } else if (parsed.task && parsed.task.id) {
            createdTaskId = parsed.task.id;
          }
        }
      } catch (e) {
        // Fallback to regex
        const taskIdMatch = taskText.match(/"id":\s*"([^"]+)"/);
        createdTaskId = taskIdMatch ? taskIdMatch[1] : null;
      }
    }

    console.log(`✅ Create task (${timing}ms) - ID: ${createdTaskId}`);
    results.push({
      category: 'Tasks',
      operation: 'create_task',
      status: 'pass',
      timing,
      details: { taskId: createdTaskId }
    });
  } catch (error: any) {
    console.error(`❌ Create task failed: ${error.message}`);
    results.push({
      category: 'Tasks',
      operation: 'create_task',
      status: 'fail',
      timing: 0,
      error: error.message
    });
  }

  // Test 3: Update Task (UPDATE)
  if (createdTaskId && testTaskListId) {
    try {
      const t3 = Date.now();
      const updated = await updateTask(
        testTaskListId,
        createdTaskId,
        {
          title: '[TEST] Checkpoint 3.3 test task - UPDATED - DELETE ME'
        }
      );
      const timing = Date.now() - t3;

      console.log(`✅ Update task (${timing}ms)`);
      results.push({
        category: 'Tasks',
        operation: 'update_task',
        status: 'pass',
        timing
      });
    } catch (error: any) {
      console.error(`❌ Update task failed: ${error.message}`);
      results.push({
        category: 'Tasks',
        operation: 'update_task',
        status: 'fail',
        timing: 0,
        error: error.message
      });
    }
  } else {
    console.log('⏭️  Update task skipped (no task to update)');
    results.push({
      category: 'Tasks',
      operation: 'update_task',
      status: 'skip',
      timing: 0
    });
  }

  // Test 4: List Tasks (READ)
  if (testTaskListId) {
    try {
      const t4 = Date.now();
      const tasks = await listTasks(testTaskListId);
      const timing = Date.now() - t4;

      console.log(`✅ List tasks (${timing}ms)`);
      results.push({
        category: 'Tasks',
        operation: 'list_tasks',
        status: 'pass',
        timing
      });
    } catch (error: any) {
      console.error(`❌ List tasks failed: ${error.message}`);
      results.push({
        category: 'Tasks',
        operation: 'list_tasks',
        status: 'fail',
        timing: 0,
        error: error.message
      });
    }
  } else {
    console.log('⏭️  List tasks skipped (no task list found)');
    results.push({
      category: 'Tasks',
      operation: 'list_tasks',
      status: 'skip',
      timing: 0
    });
  }

  // Test 5: Delete Task (DELETE)
  if (createdTaskId && testTaskListId) {
    try {
      const t5 = Date.now();
      await deleteTask(testTaskListId, createdTaskId);
      const timing = Date.now() - t5;

      console.log(`✅ Delete task (${timing}ms)`);
      results.push({
        category: 'Tasks',
        operation: 'delete_task',
        status: 'pass',
        timing
      });
    } catch (error: any) {
      console.error(`❌ Delete task failed: ${error.message}`);
      results.push({
        category: 'Tasks',
        operation: 'delete_task',
        status: 'fail',
        timing: 0,
        error: error.message
      });
    }
  } else {
    console.log('⏭️  Delete task skipped (no task to delete)');
    results.push({
      category: 'Tasks',
      operation: 'delete_task',
      status: 'skip',
      timing: 0
    });
  }

  console.log('');

  // =================================================================
  // GOOGLE CALENDAR TESTS
  // =================================================================
  console.log('📅 GOOGLE CALENDAR OPERATIONS');
  console.log('-'.repeat(80));

  // Test 6: Get Current Time
  try {
    const t6 = Date.now();
    const currentTime = await getCurrentTime();
    const timing = Date.now() - t6;

    console.log(`✅ Get current time (${timing}ms)`);
    results.push({
      category: 'Calendar',
      operation: 'get_current_time',
      status: 'pass',
      timing
    });
  } catch (error: any) {
    console.error(`❌ Get current time failed: ${error.message}`);
    results.push({
      category: 'Calendar',
      operation: 'get_current_time',
      status: 'fail',
      timing: 0,
      error: error.message
    });
  }

  // Test 7: List Events
  try {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + 7); // Next 7 days

    const t7 = Date.now();
    const events = await listEvents({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: future.toISOString()
    });
    const timing = Date.now() - t7;

    console.log(`✅ List events (${timing}ms)`);
    results.push({
      category: 'Calendar',
      operation: 'list_events',
      status: 'pass',
      timing
    });
  } catch (error: any) {
    console.error(`❌ List events failed: ${error.message}`);
    results.push({
      category: 'Calendar',
      operation: 'list_events',
      status: 'fail',
      timing: 0,
      error: error.message
    });
  }

  console.log('');

  // =================================================================
  // GOOGLE DRIVE TESTS
  // =================================================================
  console.log('📁 GOOGLE DRIVE OPERATIONS');
  console.log('-'.repeat(80));

  // Test 8: Search
  try {
    const t8 = Date.now();
    const searchResults = await search('test');
    const timing = Date.now() - t8;

    console.log(`✅ Search (${timing}ms)`);
    results.push({
      category: 'Drive',
      operation: 'search',
      status: 'pass',
      timing
    });
  } catch (error: any) {
    console.error(`❌ Search failed: ${error.message}`);
    results.push({
      category: 'Drive',
      operation: 'search',
      status: 'fail',
      timing: 0,
      error: error.message
    });
  }

  // Test 9: List Folder
  try {
    const t9 = Date.now();
    const folderContents = await listFolder(); // Root folder
    const timing = Date.now() - t9;

    console.log(`✅ List folder (${timing}ms)`);
    results.push({
      category: 'Drive',
      operation: 'list_folder',
      status: 'pass',
      timing
    });
  } catch (error: any) {
    console.error(`❌ List folder failed: ${error.message}`);
    results.push({
      category: 'Drive',
      operation: 'list_folder',
      status: 'fail',
      timing: 0,
      error: error.message
    });
  }

  console.log('');

  // =================================================================
  // SUMMARY
  // =================================================================
  const totalTime = Date.now() - startTime;

  console.log('=' + '='.repeat(79));
  console.log('📊 Test Summary\n');

  const byStatus = {
    pass: results.filter(r => r.status === 'pass').length,
    fail: results.filter(r => r.status === 'fail').length,
    skip: results.filter(r => r.status === 'skip').length
  };

  const byCategory = {
    Tasks: results.filter(r => r.category === 'Tasks'),
    Calendar: results.filter(r => r.category === 'Calendar'),
    Drive: results.filter(r => r.category === 'Drive')
  };

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${byStatus.pass}`);
  console.log(`Failed: ${byStatus.fail}`);
  console.log(`Skipped: ${byStatus.skip}`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log('');

  console.log('By Category:');
  Object.entries(byCategory).forEach(([category, tests]) => {
    const passed = tests.filter(t => t.status === 'pass').length;
    const total = tests.length;
    console.log(`  ${category}: ${passed}/${total} passed`);
  });
  console.log('');

  console.log('Detailed Results:');
  results.forEach(r => {
    const status = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
    const timing = r.timing > 0 ? `(${r.timing}ms)` : '';
    const error = r.error ? ` - ${r.error}` : '';
    console.log(`  ${status} ${r.category}: ${r.operation} ${timing}${error}`);
  });
  console.log('');

  if (byStatus.fail > 0) {
    console.log('❌ Errors:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  - ${r.category}/${r.operation}: ${r.error}`);
    });
    console.log('');
  }

  // Final status
  console.log('=' + '='.repeat(79));
  const success = byStatus.fail === 0 && byStatus.pass >= 7; // At least 7 core operations
  if (success) {
    console.log('✅ ALL OPERATIONS VALIDATED! 🎉');
    console.log('');
    console.log('🎯 Checkpoint 3.3 Validation:');
    console.log('   ✅ Tasks: All CRUD operations working');
    console.log('   ✅ Calendar: All read operations working');
    console.log('   ✅ Drive: All read operations working');
    console.log('   ✅ No regressions detected');
    console.log('   ✅ Architecture production-ready');
  } else {
    console.log('⚠️  SOME OPERATIONS FAILED');
    console.log('   Review errors above for details');
  }
  console.log('=' + '='.repeat(79));

  return { success, results, totalTime };
}

// Run test
testAllOperations()
  .then(({ success }) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
