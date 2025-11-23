/**
 * Google Credentials Loader
 *
 * Shared utility to load Google OAuth credentials from file
 * instead of hardcoding them in each wrapper.
 *
 * Location: ~/.claude/credentials/google.env
 */

import { readFileSync } from 'fs';
import * as path from 'path';

/**
 * Load Google credentials from credential file
 *
 * @returns Object with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * @throws Error if credentials file not found or missing required values
 */
export function loadGoogleCredentials(): {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN: string;
} {
  const credPath = path.resolve(
    process.env.HOME || "",
    ".claude/credentials/google.env"
  );

  try {
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

    const clientId = envVars.GOOGLE_CLIENT_ID;
    const clientSecret = envVars.GOOGLE_CLIENT_SECRET;
    const refreshToken = envVars.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing required Google credentials in ' + credPath);
    }

    return {
      GOOGLE_CLIENT_ID: clientId,
      GOOGLE_CLIENT_SECRET: clientSecret,
      GOOGLE_REFRESH_TOKEN: refreshToken,
    };
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(
        `Google credentials file not found at ${credPath}. ` +
        `Please create the file with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.`
      );
    }
    throw error;
  }
}
