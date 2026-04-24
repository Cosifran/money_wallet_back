import { supabase } from '../config/supabaseClient.js';

/**
 * Database service for transactions using PostgreSQL.
 * Replaces Google Sheets API integration.
 */
const dbService = {
    /**
     * Get all transactions for a user.
     * Maps to the old getAllTransactions from sheetService.
     */
    async getAll(userId) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }

        // Map to match the old Google Sheets response format
        return data.map(row => ({
            IdOriginal: row.id_original,
            Id: row.id,
            Fecha: row.fecha,
            Asunto: row.asunto,
            Tipo_de_transferencia: row.tipo_de_transferencia,
            Tipo: row.tipo,
            Name: row.name,
            Cantidad: row.cantidad,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
    },

    /**
     * Create a new transaction.
     * Maps to the old createTransaction from sheetService.
     */
    async create(userId, transactionData) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: userId,
                id_original: crypto.randomUUID(),
                fecha: new Date().toISOString(),
                asunto: transactionData.Asunto || '',
                tipo_de_transferencia: transactionData.Tipo_de_transferencia || '',
                tipo: transactionData.Tipo || '',
                name: transactionData.Name || '',
                cantidad: parseFloat(transactionData.Cantidad) || 0,
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }

        return {
            IdOriginal: data.id_original,
            Id: data.id,
            Fecha: data.fecha,
            Asunto: data.asunto,
            Tipo_de_transferencia: data.tipo_de_transferencia,
            Tipo: data.tipo,
            Name: data.name,
            Cantidad: data.cantidad,
        };
    },

    /**
     * Update an existing transaction by id_original.
     * Maps to the old updateTransaction from sheetService.
     */
    async update(idOriginal, userId, updatedData) {
        const updatePayload = {
            updated_at: new Date().toISOString(),
        };

        // Only include fields that are provided and defined
        if (updatedData.Fecha !== undefined) updatePayload.fecha = updatedData.Fecha;
        if (updatedData.Asunto !== undefined) updatePayload.asunto = updatedData.Asunto;
        if (updatedData.Tipo_de_transferencia !== undefined) updatePayload.tipo_de_transferencia = updatedData.Tipo_de_transferencia;
        if (updatedData.Tipo !== undefined) updatePayload.tipo = updatedData.Tipo;
        if (updatedData.Name !== undefined) updatePayload.name = updatedData.Name;
        if (updatedData.Cantidad !== undefined) updatePayload.cantidad = parseFloat(updatedData.Cantidad);

        const { data, error } = await supabase
            .from('transactions')
            .update(updatePayload)
            .eq('id_original', idOriginal)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }

        if (!data) {
            throw new Error('Transaction not found');
        }

        return {
            IdOriginal: data.id_original,
            Id: data.id,
            Fecha: data.fecha,
            Asunto: data.asunto,
            Tipo_de_transferencia: data.tipo_de_transferencia,
            Tipo: data.tipo,
            Name: data.name,
            Cantidad: data.cantidad,
        };
    },

    /**
     * Delete a transaction by id_original.
     * Maps to the old deleteTransaction from sheetService.
     */
    async delete(idOriginal, userId) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id_original', idOriginal)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },
};

export default dbService;