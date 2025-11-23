#!/usr/bin/env bun

/**
 * OAuth Callback Server
 *
 * Run this script BEFORE triggering the OAuth flow.
 * It will catch the callback from Google and save the authorization code.
 *
 * Usage:
 *   1. Run: bun run oauth-callback-server.ts
 *   2. In another terminal, trigger the OAuth flow (run the MCP test)
 *   3. Authorize in the browser
 *   4. The callback will be caught and tokens exchanged automatically
 */

import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

const PORT = 3000;
const CREDENTIALS_PATH = path.resolve(process.env.HOME || '', '.claude/credentials/google-oauth.json');
const CALENDAR_TOKENS_PATH = path.resolve(process.env.HOME || '', '.config/google-calendar-mcp/tokens.json');
const DRIVE_TOKENS_PATH = path.resolve(process.env.HOME || '', '.config/google-drive-mcp/tokens.json');

console.log('🔐 OAuth Callback Server Starting...\n');
console.log(`📍 Listening on: http://localhost:${PORT}`);
console.log(`📂 Tokens will be saved to:`);
console.log(`   - ${CALENDAR_TOKENS_PATH}`);
console.log(`   - ${DRIVE_TOKENS_PATH}\n`);

// Read credentials
let credentials;
try {
  const credContent = readFileSync(CREDENTIALS_PATH, 'utf-8');
  credentials = JSON.parse(credContent);
  console.log('✅ Loaded OAuth credentials');
} catch (error) {
  console.error('❌ Failed to load credentials from:', CREDENTIALS_PATH);
  console.error(error);
  process.exit(1);
}

const { client_id, client_secret } = credentials.installed;

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code: string): Promise<any> {
  console.log('\n🔄 Exchanging authorization code for tokens...');

  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code,
    client_id,
    client_secret,
    redirect_uri: `http://localhost:${PORT}/oauth2callback`,
    grant_type: 'authorization_code',
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${error}`);
    }

    const tokens = await response.json();
    console.log('✅ Successfully obtained tokens');

    return tokens;
  } catch (error) {
    console.error('❌ Failed to exchange code for tokens:');
    console.error(error);
    throw error;
  }
}

// Save tokens to both Calendar and Drive MCP directories
function saveTokens(tokens: any) {
  console.log('\n💾 Saving tokens to both Calendar and Drive directories...');

  // Format for google MCPs
  const tokenData = {
    type: 'authorized_user',
    client_id,
    client_secret,
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
    expiry_date: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
  };

  try {
    // Save to Calendar MCP
    writeFileSync(CALENDAR_TOKENS_PATH, JSON.stringify(tokenData, null, 2));
    console.log(`✅ Tokens saved to: ${CALENDAR_TOKENS_PATH}`);

    // Save to Drive MCP
    writeFileSync(DRIVE_TOKENS_PATH, JSON.stringify(tokenData, null, 2));
    console.log(`✅ Tokens saved to: ${DRIVE_TOKENS_PATH}`);

    console.log('\n📊 Token Info:');
    console.log(`   Access Token: ${tokens.access_token?.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${tokens.refresh_token?.substring(0, 20)}...`);
    console.log(`   Expires In: ${tokens.expires_in} seconds`);
    console.log(`   Scope: ${tokens.scope}`);
  } catch (error) {
    console.error('❌ Failed to save tokens:');
    console.error(error);
    throw error;
  }
}

// Create HTTP server
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);

  // Handle OAuth callback (both root / and /oauth2callback paths)
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/oauth2callback') {
    const { code, error } = parsedUrl.query;

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>OAuth Error</title></head>
          <body>
            <h1 style="color: red;">❌ Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
      console.error(`\n❌ OAuth error: ${error}`);
      server.close();
      process.exit(1);
    }

    if (code && typeof code === 'string') {
      console.log('\n✅ Received authorization code from Google');

      try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Save tokens
        saveTokens(tokens);

        // Send success response
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Authorization Successful</title></head>
            <body>
              <h1 style="color: green;">✅ Authorization Successful!</h1>
              <p>Tokens have been saved. You can close this window.</p>
              <script>setTimeout(() => window.close(), 3000);</script>
            </body>
          </html>
        `);

        console.log('\n🎉 OAuth flow completed successfully!');
        console.log('✅ You can now test the Google Calendar/Drive MCPs\n');

        // Close server after a delay
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Token Exchange Failed</title></head>
            <body>
              <h1 style="color: red;">❌ Token Exchange Failed</h1>
              <p>Check the terminal for error details.</p>
            </body>
          </html>
        `);
        server.close();
        process.exit(1);
      }
    } else {
      // No code or error - show instructions
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>OAuth Callback Server</title></head>
          <body>
            <h1>🔐 OAuth Callback Server Running</h1>
            <p>Waiting for OAuth callback from Google...</p>
            <p>Please complete the authorization in your browser.</p>
          </body>
        </html>
      `);
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('\n✅ Server is ready!');
  console.log('\n📋 Next Steps:');
  console.log('   1. In another terminal, run your Google Calendar/Drive MCP test');
  console.log('   2. Or manually start the OAuth flow');
  console.log('   3. Authorize the app in your browser');
  console.log('   4. The callback will be automatically handled\n');
  console.log('⏳ Waiting for OAuth callback...\n');
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Server stopped. OAuth flow cancelled.');
  server.close();
  process.exit(0);
});
