/* =====================================================
app.js
Lógica específica de index.html:
- Carga los tours desde data/tours.json (fetch)
- Pinta "Tours destacados" con los mejor calificados
- Aplica los filtros (provincia, tipo, personas, fecha,
búsqueda del header y botones de actividad) y muestra
los resultados en la MISMA sección de destacados
===================================================== */

/* Lista donde se almacenan todos los tours cargados desde el archivo JSON */
let todosLosTours = [];
/* Guarda la categoría seleccionada en "Explora por actividad" */
let categoriaActividadSeleccionada = "";

/* Referencias a los elementos del HTML */
const inputBuscar = document.getElementById("buscar");
const selectProvincia = document.getElementById("filtroProvincia");
const selectCategoria = document.getElementById("filtroCategoria");
const inputFecha = document.getElementById("fecha");
const inputPersonas = document.getElementById("cantidadPersonas");
const botonBuscarTour = document.getElementById("btnFiltrarInformacion");
const contenedorDestacados = document.getElementById("toursDestacados");
const tituloDestacados = document.getElementById("destacados-heading");
const subtituloDestacados = document.getElementById("destacados-subtitulo");

/* Carga los tours desde el archivo JSON */
async function cargarTours() {
    try {
        const respuesta = await fetch("data/tours.json");

        /* Verifica que la respuesta del servidor sea correcta */
        if (!respuesta.ok) {
            throw new Error("Respuesta no válida del servidor");
        }

        /* Convierte el JSON en un arreglo de objetos */
        todosLosTours = await respuesta.json();
        mostrarDestacadosPorDefecto();

    } catch (error) {
        /* Muestra un mensaje si ocurre un error al cargar los datos */
        console.error("Error cargando data/tours.json:", error);
        contenedorDestacados.innerHTML = `
            <li class="sin-resultados">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>No se pudieron cargar los tours. Intenta recargar la página.</p>
            </li>`;
    }
}

/* Muestra los 4 tours con mejor calificación */
function mostrarDestacadosPorDefecto() {
    const destacados = [...todosLosTours]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    pintarResultados(destacados, false);
}

/* Aplica todos los filtros seleccionados por el usuario */
function aplicarFiltros() {

    /* Obtiene los valores de los filtros */
    const texto = inputBuscar.value.trim().toLowerCase();
    const provincia = selectProvincia.value;
    const tipo = selectCategoria.value;
    const personas = Number(inputPersonas.value) || 1;

    /* Filtra únicamente los tours que cumplen todas las condiciones */
    const resultado = todosLosTours.filter(tour => {

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

        /* Verifica la categoría elegida desde las tarjetas de actividad */
        const coincideActividad =
            !categoriaActividadSeleccionada ||
            tour.categoria === categoriaActividadSeleccionada;

        /* Verifica que el tour acepte la cantidad de personas */
        const alcanzaParaElGrupo = tour.personasMax >= personas;

        /* Solo devuelve los tours que cumplen todas las condiciones */
        return (
            coincideTexto &&
            coincideProvincia &&
            coincideTipo &&
            coincideActividad &&
            alcanzaParaElGrupo
        );
    });

    /* Determina si existe al menos un filtro activo */
    const hayFiltrosActivos =
        texto || provincia || tipo || categoriaActividadSeleccionada || personas > 1;

    /* Muestra los resultados encontrados */
    pintarResultados(resultado, hayFiltrosActivos);
}

/* Actualiza el título, subtítulo y la lista de tours */
function pintarResultados(listaTours, hayFiltrosActivos) {
    tituloDestacados.textContent = hayFiltrosActivos
        ? "Resultados de tu búsqueda"
        : "Tours destacados";

    subtituloDestacados.textContent = hayFiltrosActivos
        ? `${listaTours.length} ${listaTours.length === 1 ? "tour encontrado" : "tours encontrados"}`
        : "Las experiencias favoritas de quienes ya viajaron con nosotros";

    /* Dibuja las tarjetas de los tours */
    renderizarListaTours(contenedorDestacados, listaTours, false);
    aplicarEstadoFavoritos(); //Actualiza el estado de los favoritos
}

/* Limpia los filtros */
function limpiarFiltros() {
    inputBuscar.value = "";
    selectProvincia.value = "";
    selectCategoria.value = "";
    inputPersonas.value = 1;
    categoriaActividadSeleccionada = "";
    document.querySelectorAll(".actividad-card").forEach(boton => boton.classList.remove("activo"));
    mostrarDestacadosPorDefecto();
}

/* Eventos de las tarjetas "Explora por actividad" */
document.querySelectorAll(".actividad-card").forEach(boton => {
    boton.addEventListener("click", () => {
        const yaEstabaActivo = boton.classList.contains("activo");

        document.querySelectorAll(".actividad-card").forEach(b => b.classList.remove("activo"));

        /* Activa o desactiva la categoría */
        categoriaActividadSeleccionada = yaEstabaActivo ? "" : boton.dataset.categoria;
        if (!yaEstabaActivo) boton.classLsist.add("activo");

        /* Desplaza la página hasta la sección de resultados */
        aplicarFiltros();
        contenedorDestacados.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

/* Eventos de los filtros principales */
selectProvincia.addEventListener("change", aplicarFiltros);
selectCategoria.addEventListener("change", aplicarFiltros);
inputPersonas.addEventListener("change", aplicarFiltros);
/* Filtra mientras el usuario escribe */
inputBuscar.addEventListener("input", () => {
    aplicarFiltros();
    /* Desplaza la página si los resultados no son visibles */
    desplazarSiNoEsVisible(contenedorDestacados, subtituloDestacados);
});

/* Evento del botón Buscar */
botonBuscarTour.addEventListener("click", (evento) => {
    /* Evita que el formulario recargue la página */
    evento.preventDefault();
    aplicarFiltros();
    /* Lleva al usuario hasta los resultados */
    contenedorDestacados.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* Detecta clics en cualquier botón para quitar los filtros */
document.addEventListener("click", (evento) => {
    if (evento.target.closest(".btn-limpiar-filtros")) {
        limpiarFiltros();
    }
});

/* Evita que se puedan seleccionar fechas anteriores al día actual */
impedirFechasPasadas(inputFecha); // viene de utilidades.js
/* Inicia la carga de los tours al abrir la página */
cargarTours();