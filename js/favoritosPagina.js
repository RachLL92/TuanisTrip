/* =====================================================
favoritosPagina.js
Este archivo carga y muestra los tours y guías
que el usuario ha agregado a favoritos.
Obtiene los favoritos desde localStorage, carga
los archivos JSON y muestra únicamente los
elementos guardados.
===================================================== */

// Contenedores donde se mostrarán las tarjetas
const contenedorTours = document.getElementById("contenedorToursFavoritos");
const contenedorGuias = document.getElementById("contenedorGuiasFavoritos");

// ------------------------------------------------------
// Cargar los favoritos
// ------------------------------------------------------

/* Obtiene los favoritos y carga la información necesaria */
async function cargarFavoritos() {

    try {

        const favoritos = obtenerFavoritos();

        // Cargar los tours
        const respuestaTours = await fetch("data/tours.json");
        const tours = await respuestaTours.json();

        // Cargar los guías
        const respuestaGuias = await fetch("data/guias.json");
        const guias = await respuestaGuias.json();

        mostrarToursFavoritos(tours, favoritos);

        mostrarGuiasFavoritos(guias, favoritos);

    }

    catch (error) {

        /* Muestra el error en la consola */
        console.error("Error al cargar los favoritos:", error);

    }

}

// ------------------------------------------------------
// Mostrar los tours favoritos
// ------------------------------------------------------

function mostrarToursFavoritos(tours, favoritos) {

    const listaTours = tours.filter(tour =>
        favoritos.some(favorito =>
            favorito.tipo === "tour" &&
            favorito.id === tour.id
        )
    );

    if (listaTours.length === 0) {

        /* Si no hay favoritos, muestra un mensaje */
        contenedorTours.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-regular fa-heart"></i>
                <p>No has agregado tours a favoritos.</p>
            </div>`;

        return;

    }

    /* Genera las tarjetas de los tours */
    renderizarListaTours(contenedorTours, listaTours, true);

    /* Actualiza el estado de los corazones */
    aplicarEstadoFavoritos();

}

// ------------------------------------------------------
// Mostrar los guías favoritos
// ------------------------------------------------------

function mostrarGuiasFavoritos(guias, favoritos) {

    /* Busca los guías guardados como favoritos */
    const listaGuias = guias.filter(guia =>
        favoritos.some(favorito =>
            favorito.tipo === "guia" &&
            favorito.id === guia.id
        )
    );

    if (listaGuias.length === 0) {

        /* Si no hay guías favoritos, muestra un mensaje */
        contenedorGuias.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-regular fa-heart"></i>
                <p>No has agregado guías a favoritos.</p>
            </div>`;

        return;

    }

    contenedorGuias.innerHTML = "";

    /* Recorre la lista y crea una tarjeta para cada guía */
    listaGuias.forEach(guia => {

        /* Crea el elemento de la tarjeta */
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("guia-card");

        /* Agrega el contenido de la tarjeta */
        tarjeta.innerHTML = `

            <div class="guia-imagen">

                <img src="${guia.imagen}" alt="${guia.nombre}">

                <button
                    type="button"
                    class="btn-favorito"
                    data-tipo="guia"
                    data-id="${guia.id}"
                    aria-label="Agregar a favoritos"
                    aria-pressed="false">

                    <i class="fa-regular fa-heart"></i>

                </button>

            </div>

            <div class="guia-info">

                <h3>${guia.nombre}</h3>

                <p><strong>Categoría:</strong> ${guia.categoria}</p>

                <p><strong>Especialidad:</strong> ${guia.especialidad}</p>

                <p><strong>Idiomas:</strong> ${guia.idiomas.join(", ")}</p>

                <p><strong>Experiencia:</strong> ${guia.experiencia} años</p>

                <p>
                    <strong>Calificación:</strong>
                    <span class="rating-star">★</span>
                    ${guia.calificacion}
                </p>

                <button type="button" class="btn-perfil" aria-expanded="false">
                    Ver perfil
                    <i class="fa-solid fa-chevron-down"></i>
                </button>

            </div>

            <div class="guia-detalle-extra" hidden>

                <p>${guia.descripcion}</p>

                <p class="guia-contacto">
                    <i class="fa-solid fa-phone"></i>
                    ${guia.contacto}
                </p>

                <p class="guia-instagram">
                    <i class="fa-brands fa-instagram"></i>
                    @${guia.instagram}
                </p>

            </div>

        `;

        /* Agrega el contenido de la tarjeta */
        contenedorGuias.appendChild(tarjeta);

    });

    /* Actualiza el estado de los botones de favoritos */
    aplicarEstadoFavoritos();

}

// ------------------------------------------------------
// Iniciar la carga
// ------------------------------------------------------

cargarFavoritos();

/* Si un favorito se elimina desde esta misma página,
vuelve a cargar la lista para actualizarla */
document.addEventListener("click", (evento) => {

    if (evento.target.closest(".btn-favorito")) {

        cargarFavoritos();

    }

});