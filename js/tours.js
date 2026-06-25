/* =====================================================
tours.js
Lógica específica de tours.html:
- Carga TODOS los tours desde data/tours.json
- Filtra por provincia, tipo y actividad + búsqueda
- Permite ordenar (precio / calificación)
- Cada tarjeta aquí SÍ muestra el botón de carrito
(a diferencia de index.html, que solo muestra favoritos)
===================================================== */

let todosLosTours = [];
let categoriaActividadSeleccionada = "";

const inputBuscar = document.getElementById("buscar");
const selectProvincia = document.getElementById("filtroProvinciaTours");
const selectTipo = document.getElementById("filtroTipoTours");
const selectOrden = document.getElementById("ordenTours");
const botonBuscarTours = document.getElementById("btnBuscarTours");
const contenedorCatalogo = document.getElementById("catalogoTours");
const subtituloCatalogo = document.getElementById("catalogo-subtitulo");

async function cargarTours() {
    try {
        const respuesta = await fetch("data/tours.json");

        if (!respuesta.ok) {
            throw new Error("Respuesta no válida del servidor");
        }

        todosLosTours = await respuesta.json();
        aplicarFiltros();
    } catch (error) {
        console.error("Error cargando data/tours.json:", error);
        contenedorCatalogo.innerHTML = `
            <li class="sin-resultados">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>No se pudieron cargar los tours. Intenta recargar la página.</p>
            </li>`;
        subtituloCatalogo.textContent = "";
    }
}

function ordenarTours(listaTours, criterio) {
    const copia = [...listaTours];

    switch (criterio) {
        case "precioAsc":
            return copia.sort((a, b) => a.precio - b.precio);
        case "precioDesc":
            return copia.sort((a, b) => b.precio - a.precio);
        case "rating":
            return copia.sort((a, b) => b.rating - a.rating);
        default:
            return copia;
    }
}

function aplicarFiltros() {
    const texto = inputBuscar.value.trim().toLowerCase();
    const provincia = selectProvincia.value;
    const tipo = selectTipo.value;

    let resultado = todosLosTours.filter(tour => {
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

        return coincideTexto && coincideProvincia && coincideTipo && coincideActividad;
    });

    resultado = ordenarTours(resultado, selectOrden.value);

    subtituloCatalogo.textContent =
        `${resultado.length} ${resultado.length === 1 ? "tour encontrado" : "tours encontrados"}`;

    renderizarListaTours(contenedorCatalogo, resultado, true); // true: SÍ mostrar botón de carrito
    aplicarEstadoFavoritos(); // viene de favoritos.js
}

function limpiarFiltros() {
    inputBuscar.value = "";
    selectProvincia.value = "";
    selectTipo.value = "";
    selectOrden.value = "recomendados";
    categoriaActividadSeleccionada = "";
    document.querySelectorAll(".actividad-card").forEach(boton => boton.classList.remove("activo"));
    aplicarFiltros();
}

/* --- Filtro rápido por actividad --- */
document.querySelectorAll(".actividad-card").forEach(boton => {
    boton.addEventListener("click", () => {
        const yaEstabaActivo = boton.classList.contains("activo");

        document.querySelectorAll(".actividad-card").forEach(b => b.classList.remove("activo"));

        categoriaActividadSeleccionada = yaEstabaActivo ? "" : boton.dataset.categoria;
        if (!yaEstabaActivo) boton.classList.add("activo");

        aplicarFiltros();
    });
});

/* --- Filtros del catálogo --- */
selectProvincia.addEventListener("change", aplicarFiltros);
selectTipo.addEventListener("change", aplicarFiltros);
selectOrden.addEventListener("change", aplicarFiltros);
inputBuscar.addEventListener("input", aplicarFiltros);

/* El botón "Buscar tour" no es indispensable para que el
filtro funcione (los selects y la búsqueda ya filtran al
escribir/cambiar), pero le da al usuario una acción
explícita: aplica los filtros otra vez y lo baja directo
a los resultados, sin tener que desplazarse a mano. */
botonBuscarTours.addEventListener("click", (evento) => {
    evento.preventDefault();
    aplicarFiltros();
    contenedorCatalogo.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* El botón "Quitar filtros" puede venir del estado vacío
(se crea dinámicamente) o del botón fijo en la barra de
filtros, por eso se escucha por clase, no por id. */
document.addEventListener("click", (evento) => {
    if (evento.target.closest(".btn-limpiar-filtros")) {
        limpiarFiltros();
    }
});

cargarTours();
