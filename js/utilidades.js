/* =====================================================
utilidades.js
Contiene funciones generales que pueden ser utilizadas
por distintas páginas del sitio.

Aquí se incluyen funciones para trabajar con fechas,
formato de precios, desplazamiento automático y
comportamientos compartidos.
===================================================== */

/* Obtiene la fecha actual en formato YYYY-MM-DD
   utilizando la hora local del navegador */
function obtenerFechaHoyISO() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

/* Convierte un número al formato de colones costarricenses */
function formatoColones(numero) {
    return "₡" + numero.toLocaleString("es-CR");
}

/* Evita que un campo de fecha permita seleccionar
   un día anterior a la fecha actual */
function impedirFechasPasadas(inputFecha) {
    /* Obtiene la fecha mínima permitida */
    const hoyISO = obtenerFechaHoyISO();
    inputFecha.min = hoyISO;

    /* Valida la fecha seleccionada */
    inputFecha.addEventListener("change", () => {
        if (inputFecha.value && inputFecha.value < hoyISO) {
            /* Corrige la fecha y muestra un aviso */
            inputFecha.value = hoyISO;
            alert("No es posible seleccionar una fecha que ya pasó. Se ajustó a la fecha de hoy.");
        }
    });
}

/* Verifica si un elemento ya es visible en pantalla, si no, desplaza la página hasta el */
function desplazarSiNoEsVisible(elementoAVerificar, elementoAlQueIr = elementoAVerificar) {
    /* Obtiene la posición del elemento */
    const rect = elementoAVerificar.getBoundingClientRect();
    /* Comprueba si ya está visible */
    const yaEsVisible = rect.top >= 0 && rect.top < window.innerHeight;

    /* Desplaza la página únicamente cuando sea necesario */
    if (!yaEsVisible) {
        elementoAlQueIr.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* Controla la apertura y cierre del perfil de los guías */
document.addEventListener("click", (evento) => {
    /* Busca el botón que activó el evento */
    const boton = evento.target.closest(".btn-perfil");
    if (!boton) return;

    /* Obtiene la tarjeta y la información adicional */
    const tarjeta = boton.closest(".guia-card");
    const detalle = tarjeta?.querySelector(".guia-detalle-extra");
    if (!detalle) return;

    /* Verifica si el perfil ya estaba abierto */
    const expandido = boton.getAttribute("aria-expanded") === "true";

    /* Muestra o oculta la información */
    detalle.hidden = expandido;
    boton.setAttribute("aria-expanded", String(!expandido));
    boton.classList.toggle("activo", !expandido);
    /* Cambia el texto y el ícono del botón */
    boton.innerHTML = expandido
        ? 'Ver perfil <i class="fa-solid fa-chevron-down"></i>'
        : 'Ocultar perfil <i class="fa-solid fa-chevron-up"></i>';
});