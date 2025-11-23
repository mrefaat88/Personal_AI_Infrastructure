#!/usr/bin/env bun

/**
 * OAuth Helper for Google Calendar/Drive MCPs
 *
 * This script helps complete the OAuth flow by:
 * 1. Starting a local server on port 3000 to catch the OAuth callback
 * 2. Opening the browser for authorization
 * 3. Saving the tokens to the appropriate location
 */

import { createServer } from 'http';
import { parse } from 'url';
import { spawn } from 'child_process';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;

console.log('🔐 Starting OAuth Helper for Google Calendar/Drive\n');
console.log(`✅ Local callback server will listen on port ${PORT}`);
console.log('📝 After authorization, tokens will be saved to ~/.config/google-calendar-mcp/tokens.json\n');

// Create HTTP server to catch OAuth callback
const server = createServer((req, res) => {
  const parsedUrl = parse(req.url || '', true);
  const { code, error } = parsedUrl.query;

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h1>❌ Authorization Failed</h1><p>Error: ${error}</p>`);
    console.error(`\n❌ OAuth error: ${error}`);
    process.exit(1);
  }

  if (code) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>✅ Authorization Successful!</h1>
      <p>You can close this window and return to the terminal.</p>
      <script>setTimeout(() => window.close(), 2000);</script>
    `);

    console.log(`\n✅ Received authorization code: ${code}\n`);
    console.log('🔄 Exchanging code for tokens...\n');

    // Close the server
    server.close();

    // TODO: Exchange code for tokens
    // For now, just show the code
    console.log('⚠️  Manual token exchange needed. Authorization code:');
    console.log(code);
    console.log('\nYou can use this code to manually complete the OAuth flow.');

    process.exit(0);
  }

  // Not the callback URL
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🌐 Server listening on http://localhost:${PORT}\n`);
  console.log('🚀 Now run the Google Calendar/Drive MCP to start OAuth flow...\n');
  console.log('Or manually visit the Google OAuth URL with:');
  console.log(`   redirect_uri=${REDIRECT_URI}`);
  console.log('\nWaiting for OAuth callback...\n');
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Server stopped. OAuth flow cancelled.');
  server.close();
  process.exit(0);
});
