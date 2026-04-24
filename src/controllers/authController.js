import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Sign up a new user with email and password.
 * POST /api/auth/signup
 * Body: { email, password }
 */
export async function signup(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully. Check email for confirmation.',
            user: data.user ? {
                id: data.user.id,
                email: data.user.email
            } : null,
            session: data.session
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Sign in with email and password.
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: data.user.id,
                email: data.user.email
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                expires_in: data.session.expires_in
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Sign out (invalidate session).
 * POST /api/auth/logout
 * Headers: { Authorization: Bearer <token> }
 */
export async function logout(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const { error } = await supabase.auth.signOut({
            scope: 'global'
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Get current user info.
 * GET /api/auth/me
 * Headers: { Authorization: Bearer <token> }
 */
export async function getMe(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Refresh the access token using a refresh token.
 * POST /api/auth/refresh
 * Body: { refresh_token }
 */
export async function refreshToken(req, res, next) {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                expires_in: data.session.expires_in
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Request password reset email.
 * POST /api/auth/reset-password
 * Body: { email }
 */
export async function resetPassword(req, res, next) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset email sent. Check your inbox.'
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Update user password (when already authenticated).
 * POST /api/auth/update-password
 * Headers: { Authorization: Bearer <token> }
 * Body: { newPassword }
 */
export async function updatePassword(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { newPassword } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Update the user's password
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        next(err);
    }
}