/* =====================================================
app.js
Lógica específica de index.html:
- Carga los tours desde data/tours.json (fetch)
- Pinta "Tours destacados" con los mejor calificados
- Aplica los filtros (provincia, tipo, personas, fecha,
búsqueda del header y botones de actividad) y muestra
los resultados en la MISMA sección de destacados
===================================================== */

let todosLosTours = [];
let categoriaActividadSeleccionada = "";

const inputBuscar = document.getElementById("buscar");
const selectProvincia = document.getElementById("filtroProvincia");
const selectCategoria = document.getElementById("filtroCategoria");
const inputFecha = document.getElementById("fecha");
const inputPersonas = document.getElementById("cantidadPersonas");
const botonBuscarTour = document.getElementById("btnFiltrarInformacion");
const contenedorDestacados = document.getElementById("toursDestacados");
const tituloDestacados = document.getElementById("destacados-heading");
const subtituloDestacados = document.getElementById("destacados-subtitulo");

async function cargarTours() {
    try {
        const respuesta = await fetch("data/tours.json");

        if (!respuesta.ok) {
            throw new Error("Respuesta no válida del servidor");
        }

        todosLosTours = await respuesta.json();
        mostrarDestacadosPorDefecto();
    } catch (error) {
        console.error("Error cargando data/tours.json:", error);
        contenedorDestacados.innerHTML = `
            <li class="sin-resultados">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>No se pudieron cargar los tours. Intenta recargar la página.</p>
            </li>`;
    }
}

/* Vista inicial: los 4 tours con mejor calificación. */
function mostrarDestacadosPorDefecto() {
    const destacados = [...todosLosTours]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    pintarResultados(destacados, false);
}

/* Revisa los valores actuales de todos los filtros y
vuelve a pintar la sección de destacados con lo que
sí cumple TODAS las condiciones a la vez. */
function aplicarFiltros() {
    const texto = inputBuscar.value.trim().toLowerCase();
    const provincia = selectProvincia.value;
    const tipo = selectCategoria.value;
    const personas = Number(inputPersonas.value) || 1;

    const resultado = todosLosTours.filter(tour => {
        const coincideTexto =
            !texto ||
            tour.nombre.toLowerCase().includes(texto) ||
            tour.ubicacion.toLowerCase().includes(texto) ||
            tour.descripcion.toLowerCase().includes(texto);

        const coincideProvincia = !provincia || tour.provincia === provincia;
        const coincideTipo = !tipo || tour.tipo === tipo;
        const coincideActividad =
            !categoriaActividadSeleccionada ||
            tour.categoria === categoriaActividadSeleccionada;
        const alcanzaParaElGrupo = tour.personasMax >= personas;

        return (
            coincideTexto &&
            coincideProvincia &&
            coincideTipo &&
            coincideActividad &&
            alcanzaParaElGrupo
        );
    });

    const hayFiltrosActivos =
        texto || provincia || tipo || categoriaActividadSeleccionada || personas > 1;

    pintarResultados(resultado, hayFiltrosActivos);
}

/* Actualiza el encabezado de la sección + la grilla. */
function pintarResultados(listaTours, hayFiltrosActivos) {
    tituloDestacados.textContent = hayFiltrosActivos
        ? "Resultados de tu búsqueda"
        : "Tours destacados";

    subtituloDestacados.textContent = hayFiltrosActivos
        ? `${listaTours.length} ${listaTours.length === 1 ? "tour encontrado" : "tours encontrados"}`
        : "Las experiencias favoritas de quienes ya viajaron con nosotros";

    renderizarListaTours(contenedorDestacados, listaTours, false);
    aplicarEstadoFavoritos(); // viene de favoritos.js: repinta corazones en las tarjetas nuevas
}

function limpiarFiltros() {
    inputBuscar.value = "";
    selectProvincia.value = "";
    selectCategoria.value = "";
    inputPersonas.value = 1;
    categoriaActividadSeleccionada = "";
    document.querySelectorAll(".actividad-card").forEach(boton => boton.classList.remove("activo"));
    mostrarDestacadosPorDefecto();
}

/* --- Botones de "Explora por actividad" --- */
document.querySelectorAll(".actividad-card").forEach(boton => {
    boton.addEventListener("click", () => {
        const yaEstabaActivo = boton.classList.contains("activo");

        document.querySelectorAll(".actividad-card").forEach(b => b.classList.remove("activo"));

        categoriaActividadSeleccionada = yaEstabaActivo ? "" : boton.dataset.categoria;
        if (!yaEstabaActivo) boton.classList.add("activo");

        aplicarFiltros();
        contenedorDestacados.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

/* --- Filtros del buscador principal --- */
selectProvincia.addEventListener("change", aplicarFiltros);
selectCategoria.addEventListener("change", aplicarFiltros);
inputPersonas.addEventListener("change", aplicarFiltros);
inputBuscar.addEventListener("input", aplicarFiltros);

botonBuscarTour.addEventListener("click", (evento) => {
    evento.preventDefault();
    aplicarFiltros();
    contenedorDestacados.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* El botón "Quitar filtros" puede venir del estado vacío
(se crea dinámicamente) o del botón fijo en la barra de
filtros, por eso se escucha por clase, no por id. */
document.addEventListener("click", (evento) => {
    if (evento.target.closest(".btn-limpiar-filtros")) {
        limpiarFiltros();
    }
});

impedirFechasPasadas(inputFecha); // viene de utilidades.js
cargarTours();
