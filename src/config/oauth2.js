import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {supabase} from './supabaseClient.js';

dotenv.config();

/** Scopes OAuth 2.0 según lo configurado en Google Cloud Console */
export const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.modify',
];

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');

/**
 * Crea y devuelve un cliente OAuth2.
 * redirectUri es opcional; si no se pasa, se usa OAUTH_REDIRECT_URI.
 */
export function createOAuth2Client(redirectUri = OAUTH_REDIRECT_URI) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env');
  }
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
}

/**
 * Genera la URL de autorización de Google.
 */
export function getAuthUrl() {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Fuerza refresh token en el primer login
  });
}

/**
 * Guarda los tokens en tokens.json.
 */
export function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf8');
}

/**
 * Carga los tokens desde tokens.json. Devuelve null si no existen.
 */
export function loadTokens() {
  try {
    const data = fs.readFileSync(TOKENS_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Configura el cliente OAuth2 con tokens existentes y lo devuelve.
 * Si no hay tokens, devuelve null.
 */
export function getAuthenticatedClient() {
  const tokens = loadTokens();
  if (!tokens) return null;
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

/**
 * Intercambia el código de autorización por tokens y los guarda.
 */
export async function exchangeCodeForTokens(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  const idToken = tokens.id_token;

  const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (authError) throw authError;

const supabaseUser = authData.user;

const { error: dbError } = await supabase
  .from('user_google_tokens')
  .upsert({
    user_id: supabaseUser.id, // El ID que nos dio Supabase
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token, // ¡ESTE ES EL QUE USA n8n!
    spreadsheet_id: null, // Añadir más adelante
    expires_at: new Date(tokens.expiry_date).toISOString(),
    updated_at: new Date().toISOString()
  });

  if (dbError) {
    console.error("Error al guardar en la tabla:", dbError.message);
    throw dbError;
  }

/*   saveTokens(tokens);
  return tokens; */
}

export { TOKENS_PATH, OAUTH_REDIRECT_URI };
