# Google Sheets CRUD API

This is a Node.js Express application that performs CRUD operations on a Google Sheet.

## Prerequisites

- Node.js installed.
- A Google Cloud Platform project with the Google Sheets API enabled.
- A Service Account with access to the Google Sheet.

## Setup

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Edit `.env` and set your `SPREADSHEET_ID`.

4.  **Google Credentials**:
    - Place your Service Account JSON key file in the root directory and name it `google-credentials.json`.
    - Alternatively, update the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env` if you prefer a different location/name.

5.  **Share the Sheet**:
    - Open your Google Sheet.
    - Share it with the email address of your Service Account (found in the JSON key file, `client_email`). Give it "Editor" access.

## Usage

Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### GET /api/transacciones
Get all transactions.

**Response:**
```json
[
  {
    "IdOriginal": "uuid...",
    "Id": "...",
    "Fecha": "...",
    "Asunto": "...",
    "Tipo_de_transferencia": "...",
    "Tipo": "...",
    "Name": "...",
    "Cantidad": "..."
  },
  ...
]
```

### POST /api/transacciones
Create a new transaction.

**Body:**
```json
{
  "Id": "1",
  "Fecha": "2023-10-27",
  "Asunto": "Salary",
  "Tipo_de_transferencia": "Bank Transfer",
  "Tipo": "Income",
  "Name": "Company X",
  "Cantidad": "5000"
}
```

**Response:**
Returns the created object with the generated `IdOriginal`.

### PUT /api/transacciones/:IdOriginal
Update an existing transaction.

**Body:**
```json
{
  "Cantidad": "6000"
}
```

### DELETE /api/transacciones/:IdOriginal
Delete a transaction.

## OAuth 2.0 (Google)

Para usar Gmail y Google Sheets con consentimiento del usuario (en lugar de una Service Account), configura OAuth 2.0.

### Requisitos en Google Cloud Console

1. Crea credenciales **OAuth 2.0** (tipo "Aplicación web" o "Desktop").
2. Añade el **URI de redirección** autorizado:  
   `http://localhost:3000/api/auth/google/callback` (o el que uses en `OAUTH_REDIRECT_URI`).
3. En "Pantalla de consentimiento", solicita los ámbitos:
   - `userinfo.email`, `userinfo.profile`
   - `spreadsheets` (Google Sheets API)
   - `gmail.modify` (Gmail API)

### Variables de entorno

En `.env`:

```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Rutas de autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/google` | Redirige a Google para iniciar el login |
| GET | `/api/auth/google/callback` | Callback de Google (no llamar a mano) |
| GET | `/api/auth/success` | Página de éxito tras autenticarse |
| GET | `/api/auth/error` | Página de error OAuth |
| GET | `/api/auth/status` | Devuelve `{ authenticated, user? }` |

### Flujo

1. Abre en el navegador: `http://localhost:3000/api/auth/google`.
2. Inicia sesión en Google y acepta los permisos.
3. Tras el callback, los tokens se guardan en `tokens.json` (no versionar).
4. Usa `getAuthenticatedClient()` en `src/config/oauth2.js` para obtener un cliente autenticado y llamar a Sheets o Gmail.

## Project Structure

- `src/config`: Configuration (Google Sheets client).
- `src/controllers`: Request handlers.
- `src/routes`: API route definitions.
- `src/services`: Business logic and Google API interaction.
- `src/utils`: Utility functions.
- `app.js`: Express app setup.
- `server.js`: Server entry point.
