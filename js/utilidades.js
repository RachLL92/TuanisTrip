/* =====================================================
utilidades.js
Funciones pequeñas y genéricas que pueden usar
cualquiera de las páginas del sitio.
===================================================== */

/* Devuelve la fecha de HOY en formato "YYYY-MM-DD" usando
la hora LOCAL del usuario (no UTC). Esto es importante:
si se usara new Date().toISOString(), en Costa Rica
(UTC-6) el resultado podría adelantarse o atrasarse un
día según la hora en que se entre al sitio. */
function obtenerFechaHoyISO() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

/* Da formato de colones costarricenses a un número.
Ej: formatoColones(35000) -> "₡35 000" */
function formatoColones(numero) {
    return "₡" + numero.toLocaleString("es-CR");
}

/* Bloquea que un <input type="date"> permita escoger un
día anterior a hoy. Si el usuario ya tenía algo inválido
escrito (pegado a mano), lo corrige y avisa. */
function impedirFechasPasadas(inputFecha) {
    const hoyISO = obtenerFechaHoyISO();
    inputFecha.min = hoyISO;

    inputFecha.addEventListener("change", () => {
        if (inputFecha.value && inputFecha.value < hoyISO) {
            inputFecha.value = hoyISO;
            alert("No es posible seleccionar una fecha que ya pasó. Se ajustó a la fecha de hoy.");
        }
    });
}
