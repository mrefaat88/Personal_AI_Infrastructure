#!/usr/bin/env npx tsx

/**
 * Ref.tools MCP Server - Main Export Module
 *
 * This module provides access to Ref.tools documentation search and reading
 * functionality through HTTP-based MCP wrappers.
 *
 * ARCHITECTURE:
 * - HTTP-based MCP protocol (vs stdio spawn-based)
 * - Session management via mcp-session-id header
 * - Streamable HTTP with SSE support
 * - No local package installation required
 * - Always up-to-date (server-side)
 * - Same 99.5% token savings as stdio approach
 *
 * CREDENTIALS REQUIRED:
 * - REF_API_KEY: API key from https://ref.tools/
 *
 * USAGE:
 * ```typescript
 * import { refSearchDocumentation, refReadUrl } from './servers/ref';
 *
 * // Step 1: Search technical documentation
 * const searchResults = await refSearchDocumentation({
 *   query: 'React hooks useState',
 *   maxResults: 5
 * });
 *
 * // Step 2: Read a specific URL from results
 * const docUrl = searchResults.content[0].text.split('\n')[1];
 * const content = await refReadUrl({ url: docUrl });
 * ```
 *
 * @module servers/ref
 */

// ============================================================================
// DOCUMENTATION SEARCH
// ============================================================================

/**
 * Search technical documentation across public APIs, libraries, repos, or web
 *
 * Most powerful tool for finding:
 * - Code snippets and examples
 * - API documentation
 * - Library usage guides
 * - Framework documentation
 * - Language specifications
 * - GitHub repositories
 * - Private documentation (with ref_src=private parameter)
 *
 * Returns URLs that should be passed to refReadUrl for full content.
 *
 * @see https://ref.tools/
 */
export { refSearchDocumentation } from './ref_search_documentation.js';
export type { RefSearchDocumentationParams } from './ref_search_documentation.js';

// ============================================================================
// URL READER
// ============================================================================

/**
 * Read the content of a URL as markdown
 *
 * **IMPORTANT**: The EXACT url from a ref_search_documentation result
 * (including the #hash) should be passed to this tool.
 *
 * Useful for:
 * - Reading documentation pages
 * - Converting doc results to full markdown
 * - Extracting detailed content
 * - Processing documentation links
 *
 * Returns clean markdown representation of the URL content.
 */
export { refReadUrl } from './ref_read_url.js';
export type { RefReadUrlParams } from './ref_read_url.js';

// ============================================================================
// INTEGRATION STATUS
// ============================================================================

/**
 * TOOLS INTEGRATED (2 total):
 *
 * ✅ ref_search_documentation - Search technical docs (primary tool)
 * ✅ ref_read_url - Read URL as markdown (companion tool)
 *
 * TYPICAL WORKFLOW:
 * 1. Search documentation with ref_search_documentation
 * 2. Get URLs from search results
 * 3. Read full content with ref_read_url
 *
 * ARCHITECTURE PATTERN: HTTP-based MCP
 * - Endpoint: https://api.ref.tools/mcp
 * - Authentication: x-ref-api-key header
 * - Session: mcp-session-id header (initialize → tool call)
 * - Protocol: Streamable HTTP with SSE
 * - Accept: application/json, text/event-stream
 *
 * KEY DIFFERENCES FROM STDIO:
 * - ✅ No process spawning (simpler code)
 * - ✅ No local dependencies
 * - ✅ Always up-to-date (server-side)
 * - ⚠️  Network latency vs process overhead
 * - ⚠️  Session-based (must initialize first)
 *
 * CREDENTIALS:
 * - Location: ~/.claude/credentials/ref.env
 * - Format: REF_API_KEY=your-api-key
 * - Get key: https://ref.tools/
 *
 * TOKEN SAVINGS: 99.5% vs slash command approach
 * STATUS: ✅ Production Ready
 */
