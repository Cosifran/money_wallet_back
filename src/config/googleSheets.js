import { google } from 'googleapis';
import { createOAuth2Client } from './oauth2.js';
import { getGoogleTokensByUserId } from '../services/supabaseTokenService.js';

export const getSheetsClientForUser = async (userId) => {
  const googleTokens = await getGoogleTokensByUserId(userId);

  if (!googleTokens) {
      throw new Error('No se encontraron tokens de Google');
  }
  
  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
      access_token: googleTokens[0].access_token,
      refresh_token: googleTokens[0].refresh_token,
  });

  const sheetsClient = google.sheets({ version: 'v4', auth: oauth2Client });

  return sheetsClient;
}
