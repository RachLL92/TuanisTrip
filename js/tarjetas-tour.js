/*tarjetas-tour.js
Contiene las funciones encargadas de crear y mostrar
las tarjetas de los tours
También genera el botón para agregar al carrito y el
estado vacío cuando no existen resultados*/

/* Convierte el nombre interno de la categoría en un
texto más bonito para mostrar al usuario */
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

/* Textos que se muestran según el estado del tour */
const ETIQUETAS_ESTADO = {
    pocosCupos: "Últimos cupos",
    agotado: "Agotado"
};

/* Crea el botón para agregar un tour al carrito.
Si el tour está agotado, el botón queda deshabilitado. */
function crearBotonCarrito(tour) {

    /* Verifica si el tour ya no tiene cupos */
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

/* Construye la tarjeta completa de un tour */
function crearTarjetaTour(tour, mostrarBotonCarrito) {
     /* Obtiene el nombre de la categoría y del estado */
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

/* Muestra una lista de tarjetas de tours dentro del
contenedor recibido */
function renderizarListaTours(contenedor, listaTours, mostrarBotonCarrito) {
    /* Si no existen resultados, muestra un mensaje */
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

    /* Genera todas las tarjetas de los tours encontrados */
    contenedor.innerHTML = listaTours
        .map(tour => crearTarjetaTour(tour, mostrarBotonCarrito))
        .join("");
}