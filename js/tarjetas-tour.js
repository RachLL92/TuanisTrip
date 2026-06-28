/* =====================================================
tarjetas-tour.js
Construye el HTML de una tarjeta de tour a partir de
UN objeto que viene del archivo data/tours.json.

Se usa tanto en home.js (sección "Tours destacados")
como en tours.js (catálogo completo de tours.html),
para no repetir el mismo HTML en dos archivos distintos.
===================================================== */

/* Nombres "bonitos" para mostrar en pantalla, a partir de
los valores cortos que usamos como data-categoria en el
HTML y en el JSON (ej: "tourGastronomico" -> "Tour Gastronómico"). */
const ETIQUETAS_CATEGORIA = {
    senderismo: "Senderismo",
    montarCaballo: "Cabalgata",
    snorkel: "Snorkel",
    catamaran: "Catamarán",
    canopy: "Canopy",
    cityTour: "City Tour",
    tourGastronomico: "Tour Gastronómico",
    tourHistoricoCultural: "Tour Histórico",
    kayak: "Kayak"
};

const ETIQUETAS_ESTADO = {
    pocosCupos: "Últimos cupos",
    agotado: "Agotado"
};

/* Construye el botón de "Agregar al carrito". Si el tour
está agotado, el botón se deshabilita y avisa por qué. */
function crearBotonCarrito(tour) {
    const agotado = tour.estado === "agotado";

    return `
        <button type="button"
                class="btn-carrito-tour"
                data-tour-id="${tour.id}"
                ${agotado ? "disabled" : ""}>
            <i class="fa-solid fa-cart-plus"></i>
            ${agotado ? "Agotado" : "Agregar al carrito"}
        </button>`;
}

/* Construye la tarjeta completa de un tour.
mostrarBotonCarrito: true solo en tours.html. */
function crearTarjetaTour(tour, mostrarBotonCarrito) {
    const etiquetaCategoria = ETIQUETAS_CATEGORIA[tour.categoria] || tour.categoria;
    const etiquetaEstado = ETIQUETAS_ESTADO[tour.estado];

    return `
        <li>
            <article class="tour-card" data-id="${tour.id}">
                <figure>
                    <img src="${tour.imagen}" alt="${tour.nombre}, ${tour.ubicacion}">
                    <span class="tour-badge">${etiquetaCategoria}</span>
                    ${etiquetaEstado ? `<span class="tour-estado tour-estado--${tour.estado}">${etiquetaEstado}</span>` : ""}
                </figure>
                <div class="tour-card-content">
                    <h3>${tour.nombre}</h3>
                    <p class="tour-ubicacion">
                        <i class="fa-solid fa-location-dot"></i>
                        ${tour.ubicacion}
                    </p>
                    <p>${tour.descripcion}</p>
                    <ul class="tour-meta">
                        <li>${tour.duracionHoras} horas</li>
                        <li>${tour.personasMin} - ${tour.personasMax} personas</li>
                    </ul>
                    <div class="tour-precio">
                        <p><span class="precio">${formatoColones(tour.precio)}</span> por persona</p>
                        <p class="rating" aria-label="Calificación ${tour.rating} de 5, ${tour.resenas} reseñas">
                            <span aria-hidden="true">★</span> ${tour.rating} <span class="reviews">(${tour.resenas})</span>
                        </p>
                    </div>
                    ${mostrarBotonCarrito ? crearBotonCarrito(tour) : ""}
                </div>
                <button type="button"
                        class="btn-favorito"
                        data-tipo="tour"
                        data-id="${tour.id}"
                        aria-label="Agregar a favoritos"
                        aria-pressed="false">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </article>
        </li>`;
}

/* Pinta un arreglo de tours dentro de un <ul> y deja un
mensaje de "no hay resultados" cuando el arreglo viene
vacío (estado vacío que pide la rúbrica). */
function renderizarListaTours(contenedor, listaTours, mostrarBotonCarrito) {
    if (listaTours.length === 0) {
        contenedor.innerHTML = `
            <li class="sin-resultados">
                <i class="fa-solid fa-binoculars"></i>
                <p>No encontramos tours con esos filtros.</p>
                <button type="button" class="btn-clear btn-limpiar-filtros">
                    <i class="fa-solid fa-filter-circle-xmark"></i>
                    Quitar filtros
                </button>
            </li>`;
        return;
    }

    contenedor.innerHTML = listaTours
        .map(tour => crearTarjetaTour(tour, mostrarBotonCarrito))
        .join("");
}