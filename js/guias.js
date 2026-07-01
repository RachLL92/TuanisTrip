// ======================================================
// Información de guías turísticos
// Este archivo carga los datos desde guias.json
// y crea las tarjetas de forma dinámica.
// ======================================================

// Arreglo donde se guardarán los guías
let guias = [];

// Contenedor donde se mostrarán las tarjetas
const contenedorGuias = document.getElementById("contenedorGuias");

// Subtítulo con la cantidad de resultados (igual que en tours.html)
const subtituloGuias = document.getElementById("guias-subtitulo");

// Barra de búsqueda del header: aquí SÍ busca por nombre del guía
// (en index.html y tours.html esa misma barra sigue funcionando
// igual que antes, cada página tiene su propio archivo .js)
const inputBuscarGuias = document.getElementById("buscar");

// ------------------------------------------------------
// Cargar los datos del archivo JSON
// ------------------------------------------------------

async function cargarGuias() {

    try {
        
        const respuesta = await fetch("data/guias.json");
        
        guias = await respuesta.json();

        mostrarGuias(guias);
    }
    
    catch (error) {
        
        console.error("Error al cargar los guías:", error);
    }
}

// ------------------------------------------------------
// Mostrar las tarjetas de los guías
// ------------------------------------------------------

function mostrarGuias(listaGuias) {

    // Mismo mensaje de cantidad de resultados que usa tours.js
    subtituloGuias.textContent =
        `${listaGuias.length} ${listaGuias.length === 1 ? "guía encontrado" : "guías encontrados"}`;

    // Mismo estado vacío que usa renderizarListaTours() en tarjetas-tour.js
    if (listaGuias.length === 0) {
        contenedorGuias.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-binoculars"></i>
                <p>No encontramos guías con esos filtros.</p>
                <button type="button" class="btn-clear btn-limpiar-filtros">
                    <i class="fa-solid fa-filter-circle-xmark"></i>
                    Quitar filtros
                </button>
            </div>`;
        return;
    }

    // Limpia el contenedor antes de volver a pintar
    contenedorGuias.innerHTML = "";
    
    listaGuias.forEach(guia => {
        
        const tarjeta = document.createElement("article");
        
        tarjeta.classList.add("guia-card");
        
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

            <p><strong>Calificación:</strong>
                <span class="rating-star" aria-hidden="true">★</span>
                ${guia.calificacion}
            </p>

            <div class="acciones-guia">

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

        </div>

`;
        
        contenedorGuias.appendChild(tarjeta);
    });

    // Restaurar el estado de los favoritos
    aplicarEstadoFavoritos();

}

// ------------------------------------------------------
// Iniciar la carga de los datos
// ------------------------------------------------------

cargarGuias();

// ------------------------------------------------------
// Filtrar guías (búsqueda por nombre + categoría +
// especialidad + idioma, todo combinado)
// ------------------------------------------------------

const btnBuscarGuias = document.getElementById("btnBuscarGuias");

function aplicarFiltrosGuias() {

    const texto = inputBuscarGuias.value.trim().toLowerCase();
    const categoria = document.getElementById("categoria").value;
    const especialidad = document.getElementById("especialidad").value;
    const idioma = document.getElementById("idioma").value;

    const resultado = guias.filter(guia => {

        /* Busca coincidencias por nombre, categoría,
        especialidad o idiomas. */
        const coincideTexto =
            !texto ||
            guia.nombre.toLowerCase().includes(texto) ||
            guia.categoria.toLowerCase().includes(texto) ||
            guia.especialidad.toLowerCase().includes(texto) ||
            guia.idiomas.some(idiomaActual =>
                idiomaActual.toLowerCase().includes(texto)
            );

        const coincideCategoria =
            categoria === "" || guia.categoria === categoria;

        const coincideEspecialidad =
            especialidad === "" || guia.especialidad === especialidad;

        const coincideIdioma =
            idioma === "" || guia.idiomas.includes(idioma);

        return coincideTexto &&
            coincideCategoria &&
            coincideEspecialidad &&
            coincideIdioma;
    });

    mostrarGuias(resultado);
}

// Búsqueda instantánea por nombre: filtra mientras se escribe,
// sin necesidad de presionar el botón "Buscar guía".
inputBuscarGuias.addEventListener("input", () => {
    aplicarFiltrosGuias();
    desplazarSiNoEsVisible(contenedorGuias, subtituloGuias);
});

btnBuscarGuias.addEventListener("click", (evento) => {

    evento.preventDefault();

    aplicarFiltrosGuias();

    // Mismo salto automático hacia los resultados que usa tours.js
    contenedorGuias.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ------------------------------------------------------
// Quitar filtros (vuelve a mostrar todos los guías)
// ------------------------------------------------------

function limpiarFiltrosGuias() {

    inputBuscarGuias.value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("especialidad").value = "";
    document.getElementById("idioma").value = "";

    mostrarGuias(guias);
}

document.addEventListener("click", (evento) => {

    if (evento.target.closest(".btn-limpiar-filtros")) {

        limpiarFiltrosGuias();
    }
});