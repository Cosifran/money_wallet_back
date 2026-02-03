import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
// Import google sheets client service
import { getSheetsClientForUser } from '../config/googleSheets.js';
// Import supabase service
import { getSpreadsheetIdByUserId } from '../services/supabaseTokenService.js';
// Import common functions
import { dateToString } from '../utils/commons.js';
// Import services
const SHEET_NAME = 'Sheet1';
const RANGE = `${SHEET_NAME}!A:G`;

/**
 * Get all transactions from the sheet.
 * Assumes the first row is the header.
 */
const getAllTransactions = async (userId) => {
    try {
       const sheetsClient = await getSheetsClientForUser(userId);
       const spreadsheetId = await getSpreadsheetIdByUserId(userId);

        const response = await sheetsClient.spreadsheets.values.get({
            spreadsheetId: spreadsheetId[0].spreadsheet_id,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        const headers = rows[0];
        const data = rows.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, index) => {

                obj[header] = row[index];
            });
            return obj;
        });

        return data;
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
    }
};

/**
 * Create a new transaction.
 * Generates a new IdOriginal.
 */
const createTransaction = async (transactionData) => {
    try {
        const idOriginal = uuidv4();
        const fecha = dateToString(new Date());
        const newRow = [
            idOriginal,
            idOriginal,
            fecha,
            transactionData.Asunto || '',
            transactionData.Tipo_de_transferencia || '',
            transactionData.Tipo || '',
            transactionData.Name || '',
            transactionData.Cantidad || '',
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [newRow],
            },
        });

        return { IdOriginal: idOriginal, Id: idOriginal, Fecha: fecha, ...transactionData };
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

/**
 * Update a transaction by IdOriginal.
 */
const updateTransaction = async (idOriginal, updatedData) => {
    try {
        // 1. Find the row index
        const rowsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = rowsResponse.data.values;
        if (!rows || rows.length < 2) {
            throw new Error('Transaction not found');
        }

        // Find index (adding 1 because rows are 0-indexed in array but 1-indexed in Sheets, 
        // and we need to account for the header row if we were searching in the sheet directly,
        // but here we are searching in the array.
        // Row 1 is header (index 0). Row 2 is index 1.
        // If we find it at index i, the sheet row number is i + 1.

        const rowIndex = rows.findIndex(row => row[0] === idOriginal);

        if (rowIndex === -1) {
            throw new Error('Transaction not found');
        }

        const sheetRowNumber = rowIndex + 1;
        const existingRow = rows[rowIndex];

        // Construct updated row, preserving existing values if not provided in updatedData
        // Columns: IdOriginal, Id, Fecha, Asunto, Tipo_de_transferencia, Tipo, Name, Cantidad
        // Indices: 0, 1, 2, 3, 4, 5, 6, 7

        const updatedRow = [
            idOriginal, // IdOriginal should not change usually, but we keep it
            updatedData.Id !== undefined ? updatedData.Id : existingRow[1],
            updatedData.Fecha !== undefined ? updatedData.Fecha : existingRow[2],
            updatedData.Asunto !== undefined ? updatedData.Asunto : existingRow[3],
            updatedData.Tipo_de_transferencia !== undefined ? updatedData.Tipo_de_transferencia : existingRow[4],
            updatedData.Tipo !== undefined ? updatedData.Tipo : existingRow[5],
            updatedData.Name !== undefined ? updatedData.Name : existingRow[6],
            updatedData.Cantidad !== undefined ? updatedData.Cantidad : existingRow[7],
        ];

        const updateRange = `${SHEET_NAME}!A${sheetRowNumber}:H${sheetRowNumber}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [updatedRow],
            },
        });

        return { IdOriginal: idOriginal, ...updatedData };

    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

/**
 * Delete a transaction by IdOriginal.
 */
const deleteTransaction = async (idOriginal) => {
    try {
        // 1. Find the row index
        const rowsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = rowsResponse.data.values;
        if (!rows || rows.length < 2) {
            throw new Error('Transaction not found');
        }

        const rowIndex = rows.findIndex(row => row[0] === idOriginal);

        if (rowIndex === -1) {
            throw new Error('Transaction not found');
        }

        // Sheet row index is 0-based for batchUpdate deleteDimension
        // If rowIndex is 1 (second row in array), it corresponds to row 2 in Sheet.
        // The API expects startJson and endJson.
        // If we want to delete row 2 (index 1), start is 1, end is 2.

        const sheetId = 0; // Assuming Sheet1 is the first sheet with ID 0. Ideally we should fetch sheet ID.

        // We need to fetch the sheetId for "Sheet1" to be safe, or assume 0 if it's the default first sheet.
        // Let's try to fetch it to be robust.
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = spreadsheet.data.sheets.find(s => s.properties.title === SHEET_NAME);
        if (!sheet) {
            throw new Error(`Sheet ${SHEET_NAME} not found`);
        }
        const targetSheetId = sheet.properties.sheetId;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: targetSheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1,
                            },
                        },
                    },
                ],
            },
        });

        return { message: 'Transaction deleted successfully' };

    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

export default {
    getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
