//Import jose and dotenv
import dotenv from "dotenv";
import { jwtVerify, createRemoteJWKSet } from 'jose';

dotenv.config();

const JWKS = createRemoteJWKSet(new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

export async function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { payload: decoded } = await jwtVerify(token, JWKS );
    req.userId = decoded.sub;
    next();
  } catch (error) {
    console.error("Error de validación JWT:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
}
