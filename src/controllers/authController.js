import { getAuthUrl, exchangeCodeForTokens, loadTokens, getAuthenticatedClient } from '../config/oauth2.js';
import { google } from 'googleapis';

/**
 * Redirige al usuario a la pantalla de consentimiento de Google.
 * GET /api/auth/google
 */
export async function initiateAuth(req, res, next) {
  try {
    const url = getAuthUrl();
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}

/**
 * Recibe el código de autorización, intercambia por tokens y redirige.
 * GET /api/auth/google/callback?code=...
 */
export async function handleCallback(req, res, next) {
  try {
    const { code, error } = req.query;
    if (error) {
      return res.redirect(`/api/auth/error?error=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.status(400).json({ error: 'Falta el código de autorización (code)' });
    }
    await exchangeCodeForTokens(code);
    res.redirect('/api/auth/success');
  } catch (err) {
    next(err);
  }
}

/**
 * Página de éxito tras autenticación (redirect aquí después del callback).
 * GET /api/auth/success
 */
export async function authSuccess(req, res) {
  res.status(200).json({
    success: true,
    message: 'Autenticación con Google completada. Tokens guardados.',
  });
}

/**
 * Página de error en OAuth (p. ej. usuario denegó consentimiento).
 * GET /api/auth/error?error=...
 */
export async function authError(req, res) {
  const { error } = req.query;
  res.status(400).json({
    success: false,
    error: error || 'Error durante la autenticación con Google.',
  });
}

/**
 * Indica si hay tokens guardados y opcionalmente datos del usuario.
 * GET /api/auth/status
 */
export async function authStatus(req, res, next) {
  try {
    const tokens = loadTokens();
    if (!tokens) {
      return res.status(200).json({ authenticated: false });
    }
    const oauth2Client = getAuthenticatedClient();
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    res.status(200).json({
      authenticated: true,
      user: {
        email: data.email,
        name: data.name,
        picture: data.picture,
      },
    });
  } catch (err) {
    if (err.code === 401 || err.message?.includes('invalid_grant')) {
      return res.status(200).json({ authenticated: false });
    }
    next(err);
  }
}
