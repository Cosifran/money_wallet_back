export function dateToString(dateObj) {
    // Función auxiliar para asegurar dos dígitos (ej: 5 -> '05')
    const pad = (num) => String(num).padStart(2, '0');

    // 1. Obtener los componentes de la fecha
    // Usamos métodos 'get...' (localtime) si queremos la hora de la zona horaria del servidor.
    // Si usaste Date.UTC() al leer, considera usar 'getUTC...' para consistencia.
    // Asumiremos que trabajas con la hora local del objeto Date.

    // NOTA: getMonth() es base-cero (0=Enero), así que sumamos 1.
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear();

    // 2. Obtener los componentes de la hora
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());

    // 3. Ensamblar el formato final
    const datePart = `${day}/${month}/${year}`;
    const timePart = `${hours}:${minutes}:${seconds}`;

    return `${datePart}, ${timePart}`;
}