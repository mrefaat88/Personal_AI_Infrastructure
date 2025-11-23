#!/usr/bin/env bun

/**
 * Manual OAuth Flow - Request ALL Google API Scopes
 *
 * This script manually constructs an OAuth URL with ALL the scopes we need
 * for both Calendar and Drive MCPs, ensuring one token works for everything.
 */

import { readFileSync } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const CREDENTIALS_PATH = path.resolve(process.env.HOME || '', '.claude/credentials/google-oauth.json');
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

// Load OAuth credentials
let credentials;
try {
  const credContent = readFileSync(CREDENTIALS_PATH, 'utf-8');
  credentials = JSON.parse(credContent);
} catch (error) {
  console.error('❌ Failed to load credentials from:', CREDENTIALS_PATH);
  console.error(error);
  process.exit(1);
}

const { client_id } = credentials.installed;

// ALL scopes we need for both Calendar and Drive MCPs
const scopes = [
  // Calendar scopes
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',

  // Drive scopes
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/presentations',
].join(' ');

// Construct OAuth URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', client_id);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', scopes);
authUrl.searchParams.set('access_type', 'offline'); // Get refresh token
authUrl.searchParams.set('prompt', 'consent'); // Force consent screen to get refresh token

console.log('🔐 Manual OAuth Flow');
console.log('══════════════════════════════════════════════════════════\n');
console.log('📋 Scopes being requested:');
scopes.split(' ').forEach(scope => {
  console.log(`   • ${scope}`);
});
console.log('\n══════════════════════════════════════════════════════════\n');
console.log('🚀 Opening OAuth URL in your browser...\n');
console.log('⚠️  IMPORTANT: Make sure oauth-callback-server.ts is running!');
console.log('   (Run it in another terminal first)\n');
console.log('══════════════════════════════════════════════════════════\n');

// Open browser
const openCommand = process.platform === 'darwin' ? 'open' :
                    process.platform === 'win32' ? 'start' : 'xdg-open';

exec(`${openCommand} "${authUrl.toString()}"`, (error) => {
  if (error) {
    console.error('❌ Failed to open browser. Please manually open this URL:');
    console.error('\n' + authUrl.toString() + '\n');
  } else {
    console.log('✅ Browser opened!');
    console.log('\n📝 Steps:');
    console.log('   1. Authorize the app in your browser');
    console.log('   2. Grant ALL requested permissions (Calendar + Drive)');
    console.log('   3. Browser will redirect to localhost:3000/oauth2callback');
    console.log('   4. Callback server will exchange code for tokens');
    console.log('   5. Done!\n');
  }
});

console.log('\nIf browser doesn\'t open, manually visit:');
console.log(authUrl.toString());
