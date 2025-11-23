/**
 * Google MCP Wrappers - Main Export
 *
 * This file provides a unified export point for all Google MCP wrapper functions.
 * Use this when you want to import multiple Google services in a single import.
 *
 * Usage:
 * ```typescript
 * import { listTaskLists, listEvents, search } from './servers';
 * ```
 */

// Google Tasks exports
export {
  listTaskLists,
  listTasks,
  createTask,
  updateTask,
  deleteTask
} from './google-tasks';

// Google Calendar exports
export {
  getCurrentTime,
  listEvents
} from './google-calendar';

// Google Drive exports
export {
  search,
  listFolder
} from './google-drive';

// Type definitions for common return formats
export interface MCPTextResult {
  type: 'text';
  text: string;
}

export interface MCPImageResult {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface MCPResourceResult {
  type: 'resource';
  resource: {
    uri: string;
    text?: string;
    blob?: string;
  };
}

export type MCPResult = MCPTextResult | MCPImageResult | MCPResourceResult;
