/* =====================================================
favoritos.js

Lógica compartida de favoritos (corazón).

Se utiliza en las tarjetas de tours y de guías.

Guarda en localStorage los elementos marcados como
favoritos para conservar la información aunque el
usuario cierre o recargue la página.

===================================================== */

const CLAVE_FAVORITOS = "tuanisTripFavoritos";

/* Lee la lista de favoritos guardada.
Si no existe nada todavía, devuelve un arreglo vacío. */
function obtenerFavoritos() {

    const datos = localStorage.getItem(CLAVE_FAVORITOS);

    return datos ? JSON.parse(datos) : [];

}

/* Guarda la lista de favoritos en localStorage. */
function guardarFavoritos(listaFavoritos) {

    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(listaFavoritos));

}

/* Indica si un tour o guía ya está en favoritos. */
function esFavorito(tipo, id) {

    return obtenerFavoritos().some(favorito =>
        favorito.tipo === tipo &&
        favorito.id === id
    );

}

/* Agrega o elimina un favorito y devuelve
el nuevo estado (true = quedó como favorito). */
function alternarFavorito(tipo, id) {

    let favoritos = obtenerFavoritos();

    const existe = favoritos.some(favorito =>
        favorito.tipo === tipo &&
        favorito.id === id
    );

    if (existe) {

        favoritos = favoritos.filter(favorito =>
            !(favorito.tipo === tipo && favorito.id === id)
        );

    }

    else {

        favoritos.push({
            tipo: tipo,
            id: id
        });

    }

    guardarFavoritos(favoritos);

    return favoritos.some(favorito =>
        favorito.tipo === tipo &&
        favorito.id === id
    );

}

/* Cambia la apariencia de un botón de favorito
(clase, ícono y atributo aria). */
function pintarBotonFavorito(boton, activo) {

    boton.classList.toggle("activo", activo);

    boton.setAttribute("aria-pressed", String(activo));

    const icono = boton.querySelector("i");

    if (icono) {

        icono.classList.toggle("fa-regular", !activo);

        icono.classList.toggle("fa-solid", activo);

    }

}

/* Recorre todos los botones de favoritos de la
página y actualiza su apariencia según el
contenido de localStorage. */
function aplicarEstadoFavoritos() {

    document.querySelectorAll(".btn-favorito").forEach(boton => {

        const tipo = boton.dataset.tipo;

        const id = Number(boton.dataset.id);

        pintarBotonFavorito(
            boton,
            esFavorito(tipo, id)
        );

    });

}

/* Delegación de eventos.
Detecta el clic sobre cualquier corazón, incluso
si la tarjeta fue creada dinámicamente desde un
archivo JSON. */
document.addEventListener("click", (evento) => {

    const boton = evento.target.closest(".btn-favorito");

    if (!boton) return;

    const tipo = boton.dataset.tipo;

    const id = Number(boton.dataset.id);

    const quedoFavorito = alternarFavorito(tipo, id);

    pintarBotonFavorito(boton, quedoFavorito);

});

/* Pinta el estado correcto de todos los botones
cuando el HTML termina de cargarse. */
document.addEventListener("DOMContentLoaded", aplicarEstadoFavoritos);