/* =====================================================
tours.js
Administra el catálogo completo de tours
Carga los datos desde el archivo JSON, permite
buscar, filtrar, ordenar los tours y muestra los
resultados en la página
===================================================== */

/* Lista donde se almacenan todos los tours */
let todosLosTours = [];
/* Guarda la categoría seleccionada desde las tarjetas de actividad */
let categoriaActividadSeleccionada = "";

/* Referencias a los elementos del HTML */
const inputBuscar = document.getElementById("buscar");
const selectProvincia = document.getElementById("filtroProvinciaTours");
const selectTipo = document.getElementById("filtroTipoTours");
const selectOrden = document.getElementById("ordenTours");
const botonBuscarTours = document.getElementById("btnBuscarTours");
const contenedorCatalogo = document.getElementById("catalogoTours");
const subtituloCatalogo = document.getElementById("catalogo-subtitulo");

/* Carga los tours desde el archivo JSON */
async function cargarTours() {
    try {
        const respuesta = await fetch("data/tours.json");

        /* Verifica que la respuesta sea válida */
        if (!respuesta.ok) {
            throw new Error("Respuesta no válida del servidor");
        }

        /* Convierte el JSON en un arreglo de objetos */
        todosLosTours = await respuesta.json();

        /* Muestra los tours aplicando los filtros actuales */
        aplicarFiltros();
    } catch (error) {
         /* Muestra un mensaje si ocurre un error */
        console.error("Error cargando data/tours.json:", error);
        contenedorCatalogo.innerHTML = `
            <li class="sin-resultados">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>No se pudieron cargar los tours. Intenta recargar la página.</p>
            </li>`;
        subtituloCatalogo.textContent = "";
    }
}

/* Ordena los tours según el criterio seleccionado */
function ordenarTours(listaTours, criterio) {
    /* Crea una copia para no modificar el arreglo original */
    const copia = [...listaTours];

    switch (criterio) {
        /* Ordena por precio de menor a mayor */
        case "precioAsc":
            return copia.sort((a, b) => a.precio - b.precio);
        /* Ordena por precio de mayor a menor */
        case "precioDesc":
            return copia.sort((a, b) => b.precio - a.precio);
        /* Ordena por mejor calificación */
        case "rating":
            return copia.sort((a, b) => b.rating - a.rating);
    /* Mantiene el orden original */
        default:
            return copia;
    }
}

/* Filtra los tours según la búsqueda y los filtros seleccionados */
function aplicarFiltros() {
    /* Obtiene los valores de los filtros */
    const texto = inputBuscar.value.trim().toLowerCase();
    const provincia = selectProvincia.value;
    const tipo = selectTipo.value;

    /* Filtra únicamente los tours que cumplen las condiciones */
    let resultado = todosLosTours.filter(tour => {
        /* Busca coincidencias por nombre, ubicación o descripción */
        const coincideTexto =
            !texto ||
            tour.nombre.toLowerCase().includes(texto) ||
            tour.ubicacion.toLowerCase().includes(texto) ||
            tour.descripcion.toLowerCase().includes(texto);

        /* Verifica la provincia seleccionada */
        const coincideProvincia = !provincia || tour.provincia === provincia;
        /* Verifica el tipo de tour */
        const coincideTipo = !tipo || tour.tipo === tipo;
        /* Verifica la categoría seleccionada */
        const coincideActividad =
            !categoriaActividadSeleccionada ||
            tour.categoria === categoriaActividadSeleccionada;
        /* Solo devuelve los tours que cumplen todas las condiciones */
        return coincideTexto && coincideProvincia && coincideTipo && coincideActividad;
    });

    /* Ordena los resultados */
    resultado = ordenarTours(resultado, selectOrden.value);

    /* Actualiza el subtítulo con la cantidad encontrada */
    subtituloCatalogo.textContent =
        `${resultado.length} ${resultado.length === 1 ? "tour encontrado" : "tours encontrados"}`;

    /* Genera las tarjetas del catálogo */
    renderizarListaTours(contenedorCatalogo, resultado, true); // true: SÍ mostrar botón de carrito
    /* Actualiza el estado de los favoritos */
    aplicarEstadoFavoritos(); // viene de favoritos.js
}

/* Restablece todos los filtros a sus valores iniciales */
function limpiarFiltros() {
    inputBuscar.value = "";
    selectProvincia.value = "";
    selectTipo.value = "";
    selectOrden.value = "recomendados";

    /* Importante: limpiar la categoría ANTES de quitar el estilo
    visual y de llamar a aplicarFiltros(), para que el filtro
    quede completamente en cero y no se aplique ninguna actividad */
    categoriaActividadSeleccionada = "";
    document.querySelectorAll(".actividad-card").forEach(boton => boton.classList.remove("activo"));
    aplicarFiltros();
}

/* Eventos de las tarjetas "Explora por actividad" */
document.querySelectorAll(".actividad-card").forEach(boton => {
    boton.addEventListener("click", () => {
        /* Verifica si la categoría ya estaba seleccionada */
        const yaEstabaActivo = boton.classList.contains("activo");

        /* Quita la selección de todas las tarjetas */
        document.querySelectorAll(".actividad-card").forEach(b => b.classList.remove("activo"));

        /* Activa o desactiva la categoría */
        categoriaActividadSeleccionada = yaEstabaActivo ? "" : boton.dataset.categoria;
        if (!yaEstabaActivo) boton.classList.add("activo");

        aplicarFiltros();
    });
});

/* En TOURS los selects (provincia, tipo, orden) NO filtran al
cambiar — solo lo hace el botón "Buscar tour".
La barra de búsqueda sí filtra mientras se escribe. */
inputBuscar.addEventListener("input", () => {
    aplicarFiltros();
    /* Desplaza la página si los resultados no son visibles */
    desplazarSiNoEsVisible(contenedorCatalogo, subtituloCatalogo);
});

/* Ejecuta la búsqueda al presionar el botón */
botonBuscarTours.addEventListener("click", (evento) => {
    /* Evita que el formulario recargue la página */
    evento.preventDefault();
    aplicarFiltros();
    /* Lleva al usuario hasta los resultados */
    contenedorCatalogo.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* Detecta cualquier botón para quitar los filtros */
document.addEventListener("click", (evento) => {
    if (evento.target.closest(".btn-limpiar-filtros")) {
        limpiarFiltros();
    }
});

/* Inicia la carga de los tours al abrir la página */
cargarTours();