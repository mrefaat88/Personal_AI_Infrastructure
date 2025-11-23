/**
 * Google Tasks MCP Wrappers
 *
 * Auto-generated TypeScript wrappers for Google Tasks MCP server.
 * Provides type-safe, promise-based interface for task management.
 *
 * IMPORTANT: Response Structure
 * - Task lists have field: `name` (not `title`)
 * - Tasks array is in: `tasks` (not `items`)
 * - Task status values: 'pending' | 'completed' | 'cancelled'
 * - MCP limit: ~100 tasks per list maximum
 */

export { listTaskLists } from './list_task_lists';
export { listTasks, type ListTasksOptions } from './list_tasks';
export { createTask } from './create_task';
export { updateTask } from './update_task';
export { deleteTask } from './delete_task';
export { syncAllTasks, type SyncAllTasksOptions } from './sync_all_tasks';
