#!/usr/bin/env npx tsx
/**
 * Common Query: Get today's calendar events
 *
 * Usage:
 *   npx tsx ~/.claude/projects/code-execution-mcp/servers/google-calendar/today-events.ts
 */

import { listEvents } from './list_events';

interface CalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string; timeZone?: string; };
  end?: { dateTime?: string; date?: string; timeZone?: string; };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string; }>;
  hangoutLink?: string;
  location?: string;
  description?: string;
}

// Helper to parse MCP response
function parseEvents(result: any): CalendarEvent[] {
  const text = result.content[0]?.text || '';
  const parsed = JSON.parse(text);
  return parsed.events || [];
}

// Format dates WITHOUT milliseconds (CRITICAL for MCP compatibility)
const formatISO = (date: Date) => {
  return date.toISOString().replace(/\.\d{3}Z$/, '');
};

// Format time for display
function formatTime(dateStr?: string): string {
  if (!dateStr) return 'All day';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  });
}

async function getTodayEvents() {
  // Get today's date range in Riyadh timezone
  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));

  // Start of day (00:00:00)
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // End of day (23:59:59)
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 0);

  const timeMin = formatISO(startOfDay);
  const timeMax = formatISO(endOfDay);

  console.log(`Fetching events for ${today.toDateString()}...`);
  console.log(`Time range: ${timeMin} to ${timeMax}\n`);

  // Fetch events
  const result = await listEvents({
    calendarId: 'primary',
    timeMin,
    timeMax,
    timeZone: 'Asia/Riyadh'
  });

  const events = parseEvents(result);

  if (events.length === 0) {
    console.log('No events scheduled for today.');
    return;
  }

  console.log(`📅 Found ${events.length} event${events.length > 1 ? 's' : ''} today:\n`);

  events.forEach((event, index) => {
    const startTime = formatTime(event.start?.dateTime || event.start?.date);
    const endTime = formatTime(event.end?.dateTime || event.end?.date);
    const timeRange = event.start?.dateTime ? `${startTime} - ${endTime}` : 'All day';

    console.log(`${index + 1}. ${event.summary}`);
    console.log(`   Time: ${timeRange}`);

    if (event.location) {
      console.log(`   Location: ${event.location}`);
    }

    if (event.hangoutLink) {
      console.log(`   Meet: ${event.hangoutLink}`);
    }

    if (event.attendees && event.attendees.length > 0) {
      // Filter out the current user's email (loaded from env or common patterns)
      const userEmail = process.env.USER_EMAIL || process.env.GOOGLE_USER_EMAIL || '';
      const attendeeNames = event.attendees
        .filter(a => !userEmail || a.email !== userEmail)
        .map(a => a.displayName || a.email)
        .join(', ');
      if (attendeeNames) {
        console.log(`   Attendees: ${attendeeNames}`);
      }
    }

    console.log('');
  });
}

getTodayEvents().catch(error => {
  console.error('Error fetching calendar events:', error.message);
  process.exit(1);
});
