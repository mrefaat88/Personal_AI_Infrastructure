#!/usr/bin/env bun

/**
 * Test script for Google Calendar MCP
 * Tests the credential file integration
 */

import { listEvents } from './servers/google-calendar/list_events';

async function test() {
  console.log('🧪 Testing Google Calendar MCP with credential file...\n');

  try {
    console.log('📋 Fetching calendar events for the next 7 days...');

    // Get current time and 7 days from now in the format the MCP expects
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Format without milliseconds and timezone: 2026-01-01T00:00:00
    const formatTime = (date: Date) => {
      return date.toISOString().split('.')[0];
    };

    const result = await listEvents({
      calendarId: 'primary',
      timeMin: formatTime(now),
      timeMax: formatTime(weekFromNow),
    });

    console.log('\n✅ SUCCESS! Google Calendar MCP is working.');
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ FAILED! Error testing Google Calendar MCP:');
    console.error(error);
    process.exit(1);
  }
}

test();
