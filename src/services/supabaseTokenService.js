import { supabase } from '../config/supabaseClient.js';

/*
Save all data from the user in supabase
*/
export const saveGoogleTokens = async (authData, tokens) => {
    const supabaseUser = authData.user;

    const { error: dbError } = await supabase
        .from('user_google_tokens')
        .upsert({
            user_id: supabaseUser.id, // El ID que nos dio Supabase
            email: supabaseUser.email,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token, // ¡ESTE ES EL QUE USA n8n!
            expires_at: new Date(tokens.expiry_date).toISOString(),
            updated_at: new Date().toISOString()
        });

    if (dbError) {
        console.error("Error al guardar en la tabla:", dbError.message);
        throw dbError;
    }
};

export const getJwtTokenObject = async (authData) => {
    return {
        supabase_token: authData.session.access_token
    }
}


export const getGoogleTokensByUserId = async (userId) => {
    const { data: googleTokens, error: googleTokensError } = await supabase
        .from('user_google_tokens')
        .select('*')
        .eq('user_id', userId);

    if (googleTokensError) throw googleTokensError;

    return googleTokens;
}