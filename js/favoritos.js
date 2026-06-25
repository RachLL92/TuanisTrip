/* =====================================================
favoritos.js
Lógica COMPARTIDA de favoritos (corazón).
Se usa en index.html y en tours.html, por eso vive
en su propio archivo y no se repite el código.

Guarda en localStorage un arreglo con los ID de los
tours marcados como favoritos. Ej: [1, 5, 10]
===================================================== */

const CLAVE_FAVORITOS = "tuanisTripFavoritos";

/* Lee el arreglo de favoritos guardado en el navegador.
Si no existe nada todavía, devuelve un arreglo vacío. */
function obtenerFavoritos() {
    const datos = localStorage.getItem(CLAVE_FAVORITOS);
    return datos ? JSON.parse(datos) : [];
}

/* Sobrescribe el arreglo de favoritos en localStorage. */
function guardarFavoritos(listaFavoritos) {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(listaFavoritos));
}

/* Indica si un tour (por id) ya está en favoritos. */
function esFavorito(idTour) {
    return obtenerFavoritos().includes(idTour);
}

/* Agrega o quita un tour de favoritos y devuelve el
nuevo estado (true = quedó como favorito). */
function alternarFavorito(idTour) {
    let favoritos = obtenerFavoritos();

    if (favoritos.includes(idTour)) {
        favoritos = favoritos.filter(id => id !== idTour);
    } else {
        favoritos.push(idTour);
    }

    guardarFavoritos(favoritos);
    return favoritos.includes(idTour);
}

/* Cambia la apariencia de UN botón de corazón según si
el tour está en favoritos o no (clase + ícono + aria). */
function pintarBotonFavorito(boton, activo) {
    boton.classList.toggle("activo", activo);
    boton.setAttribute("aria-pressed", String(activo));

    const icono = boton.querySelector("i");
    if (icono) {
        icono.classList.toggle("fa-regular", !activo);
        icono.classList.toggle("fa-solid", activo);
    }
}

/* Recorre TODOS los botones de favorito presentes en la
página en este momento y los pinta según localStorage.
Hay que llamarla de nuevo después de pintar tarjetas
dinámicas (fetch + render), porque esos botones no
existían cuando se cargó la página. */
function aplicarEstadoFavoritos() {
    document.querySelectorAll(".btn-favorito").forEach(boton => {
        const idTour = Number(boton.dataset.tourId);
        pintarBotonFavorito(boton, esFavorito(idTour));
    });
}

/* Delegación de eventos: en vez de poner un "click" en cada
corazón (que puede no existir aún si se generó por JS),
escuchamos los clics en todo el documento y revisamos si
el clic vino de un botón ".btn-favorito". Así funciona
también con tarjetas creadas dinámicamente desde el JSON. */
document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-favorito");
    if (!boton) return;

    const idTour = Number(boton.dataset.tourId);
    const quedoFavorito = alternarFavorito(idTour);
    pintarBotonFavorito(boton, quedoFavorito);
});

/* Pinta el estado correcto en cuanto el HTML esté listo
(cubre los botones que ya vienen escritos en el HTML). */
document.addEventListener("DOMContentLoaded", aplicarEstadoFavoritos);
