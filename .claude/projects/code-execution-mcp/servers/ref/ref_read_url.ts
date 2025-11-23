#!/usr/bin/env npx tsx

/**
 * Ref.tools MCP Wrapper: ref_read_url
 *
 * Read the content of a URL as markdown. The EXACT url from a
 * 'ref_search_documentation' result (including the #hash) should
 * be passed to this tool.
 *
 * ARCHITECTURE: HTTP-based MCP wrapper
 * - Uses fetch() to call https://api.ref.tools/mcp
 * - Session-based protocol (initialize → tool call)
 * - Streamable HTTP with SSE support
 *
 * @module servers/ref/ref_read_url
 */

import { readFileSync } from 'fs';
import * as path from 'path';

/**
 * Parameters for reading URL content
 */
export interface RefReadUrlParams {
  /** URL to fetch and convert to markdown (should be from ref_search_documentation result) */
  url: string;
}

/**
 * Read URL content as markdown using Ref.tools
 *
 * @param params - Read parameters
 * @returns Promise with markdown content
 *
 * @example
 * ```typescript
 * // First search for documentation
 * const searchResults = await refSearchDocumentation({ query: 'React hooks' });
 * const docUrl = searchResults.content[0].text.split('\n')[1]; // Get URL from result
 *
 * // Then read the URL
 * const content = await refReadUrl({ url: docUrl });
 * ```
 */
export async function refReadUrl(params: RefReadUrlParams): Promise<any> {
  // Load API key from credentials
  const credPath = path.resolve(
    process.env.HOME || "",
    ".claude/credentials/ref.env"
  );

  const envContent = readFileSync(credPath, "utf-8");
  const envVars: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  const apiKey = envVars.REF_API_KEY;
  if (!apiKey) {
    throw new Error('REF_API_KEY not found in credentials file');
  }

  const url = `https://api.ref.tools/mcp`;

  try {
    // Step 1: Initialize session
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'ref-wrapper',
          version: '1.0.0'
        }
      }
    };

    const initResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'x-ref-api-key': apiKey,
      },
      body: JSON.stringify(initRequest)
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Init failed! status: ${initResponse.status}, body: ${errorText}`);
    }

    // Get session ID from response headers
    const sessionId = initResponse.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('No session ID received from initialization');
    }

    // Step 2: Call the tool with session ID
    const toolRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'ref_read_url',
        arguments: {
          url: params.url
        }
      }
    };

    const toolResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'x-ref-api-key': apiKey,
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify(toolRequest)
    });

    if (!toolResponse.ok) {
      const errorText = await toolResponse.text();
      throw new Error(`Tool call failed! status: ${toolResponse.status}, body: ${errorText}`);
    }

    const data = await toolResponse.json();

    if (data.error) {
      throw new Error(data.error.message || 'MCP call failed');
    }

    return data.result;
  } catch (error) {
    throw new Error(`Failed to read URL: ${error instanceof Error ? error.message : error}`);
  }
}

// CLI test mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const testUrl = process.argv[2] || "https://github.com/microsoft/typescript/blob/main/tests/baselines/reference/awaitInNonAsyncFunction.errors.txt?plain=1#L1#entire-document";

  console.log(`📖 Testing ref_read_url...`);
  console.log(`   URL: "${testUrl}"`);
  console.log('');

  refReadUrl({ url: testUrl })
    .then((result) => {
      console.log("✅ Success:");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:");
      console.error(error);
      process.exit(1);
    });
}
