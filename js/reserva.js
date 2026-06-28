/* =====================================================
reserva.js
Lógica de reserva.html
===================================================== */

/* Clave utilizada para guardar las reservas en localStorage */
const CLAVE_RESERVAS = "tuanisTripReservas";

/* Lista donde se almacenan todos los tours cargados desde el JSON */
let todosLosTours = [];

/* --- Referencias del DOM --- */
const subtituloCarrito = document.getElementById("carrito-subtitulo");
const contenedorCarritoReserva = document.getElementById("carritoReserva");
const totalCarritoReserva = document.getElementById("totalCarritoReserva");

const formReserva = document.getElementById("formReserva");
const inputNombre = document.getElementById("nombreReserva");
const inputCorreo = document.getElementById("correoReserva");
const inputTelefono = document.getElementById("telefonoReserva");
const inputMensaje = document.getElementById("mensajeReserva");
const btnConfirmarReserva = document.getElementById("btnConfirmarReserva");
const mensajeFormulario = document.getElementById("mensajeFormularioReserva");

const subtituloReservas = document.getElementById("reservas-subtitulo");
const contenedorReservas = document.getElementById("listaReservas");
const btnLimpiarReservas = document.getElementById("btnLimpiarReservas");
const confirmarLimpiarReservas = document.getElementById("confirmarLimpiarReservas");
const btnConfirmarLimpiar = document.getElementById("btnConfirmarLimpiar");
const btnCancelarLimpiar = document.getElementById("btnCancelarLimpiar");

/* =====================================================
1. CARRITO
===================================================== */

/* Carga los tours desde el archivo JSON y luego muestra
el carrito y las reservas guardadas */
async function cargarTours() {
    try {
        const respuesta = await fetch("data/tours.json");

        if (!respuesta.ok) {
            throw new Error("Respuesta no válida del servidor");
        }

        todosLosTours = await respuesta.json();
    } catch (error) {
        console.error("Error cargando data/tours.json:", error);
        contenedorCarritoReserva.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>No se pudo cargar la información de los tours. Intenta recargar la página.</p>
            </div>`;
        subtituloCarrito.textContent = "";
        return;
    }

    pintarCarrito();
    pintarReservas();
}

/* Busca y devuelve un tour según su identificador */
function obtenerTourPorId(idTour) {
    return todosLosTours.find(tour => tour.id === idTour);
}

/* Calcula el monto total de todos los tours del carrito */
function calcularTotalCarrito() {
    return obtenerCarrito().reduce((total, item) => {
        const tour = obtenerTourPorId(item.idTour);
        return tour ? total + tour.precio * item.cantidad : total;
    }, 0);
}

/* Habilita o deshabilita el botón de confirmar reserva
según el estado del carrito */
function actualizarEstadoBotonConfirmar() {
    const carrito = obtenerCarrito();
    const faltaFecha = carrito.some(item => !item.fecha);
    btnConfirmarReserva.disabled = carrito.length === 0 || faltaFecha;
}

/* Muestra todos los tours agregados al carrito */
function pintarCarrito() {
    const carrito = obtenerCarrito(); // viene de carrito.js

    if (carrito.length === 0) {
        subtituloCarrito.textContent = "Tu carrito está vacío";
        contenedorCarritoReserva.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Aún no agregaste ningún tour. Explora el catálogo y arma tu próxima aventura.</p>
                <a href="tours.html" class="btn-clear">
                    <i class="fa-solid fa-binoculars"></i>
                    Explorar tours
                </a>
            </div>`;
        totalCarritoReserva.textContent = formatoColones(0);
        actualizarEstadoBotonConfirmar();
        return;
    }

    subtituloCarrito.textContent =
        `${carrito.length} ${carrito.length === 1 ? "tour en tu carrito" : "tours en tu carrito"}`;

    let total = 0;

    contenedorCarritoReserva.innerHTML = carrito.map(item => {
        const tour = obtenerTourPorId(item.idTour);

        // Si el tour ya no existe en el JSON, no se pinta esa fila.
        if (!tour) return "";

        const subtotal = tour.precio * item.cantidad;
        total += subtotal;

        return `
            <article class="item-carrito" data-id-tour="${tour.id}">
                <img src="${tour.imagen}" alt="${tour.nombre}">

                <div class="item-carrito-info">
                    <h3>${tour.nombre}</h3>
                    <p class="item-carrito-precio">${formatoColones(tour.precio)} por persona</p>

                    <label class="item-carrito-fecha-label">
                        Fecha de este tour
                        <input type="date"
                               class="input-fecha-item ${!item.fecha ? "input-invalido" : ""}"
                               data-id-tour="${tour.id}"
                               value="${item.fecha || ""}">
                    </label>
                </div>

                <div class="item-carrito-cantidad">
                    <button type="button" class="btn-cantidad" data-accion="restar" aria-label="Quitar una persona">−</button>
                    <span>${item.cantidad}</span>
                    <button type="button" class="btn-cantidad" data-accion="sumar" aria-label="Agregar una persona">+</button>
                </div>

                <p class="item-carrito-subtotal">${formatoColones(subtotal)}</p>

                <button type="button" class="btn-eliminar-item" aria-label="Quitar ${tour.nombre} del carrito">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </article>`;
    }).join("");

    totalCarritoReserva.textContent = formatoColones(total);

    // Cada fecha es un input nuevo, así que hay que volver a aplicarle el mínimo y el listener.
    document.querySelectorAll(".input-fecha-item").forEach(input => {
        impedirFechasPasadas(input); // viene de utilidades.js

        input.addEventListener("change", () => {
            const idTour = Number(input.dataset.idTour);
            const carritoActual = obtenerCarrito();
            const itemActual = carritoActual.find(i => i.idTour === idTour);
            if (!itemActual) return;

            itemActual.fecha = input.value;
            guardarCarrito(carritoActual);

            input.classList.toggle("input-invalido", !input.value);
            actualizarEstadoBotonConfirmar();
        });
    });

    actualizarEstadoBotonConfirmar();
}

/* Controla los botones para aumentar, disminuir
o eliminar un tour del carrito */
contenedorCarritoReserva.addEventListener("click", (evento) => {
    const articulo = evento.target.closest(".item-carrito");
    if (!articulo) return;

    const idTour = Number(articulo.dataset.idTour);
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.idTour === idTour);
    if (!item) return;

    if (evento.target.closest(".btn-eliminar-item")) {
        guardarCarrito(carrito.filter(i => i.idTour !== idTour));
    } else if (evento.target.closest("[data-accion='sumar']")) {
        item.cantidad += 1;
        guardarCarrito(carrito);
    } else if (evento.target.closest("[data-accion='restar']")) {
        item.cantidad -= 1;
        if (item.cantidad <= 0) {
            guardarCarrito(carrito.filter(i => i.idTour !== idTour));
        } else {
            guardarCarrito(carrito);
        }
    } else {
        return;
    }

    actualizarContadorCarrito(); // viene de carrito.js 
    pintarCarrito();
});

/* =====================================================
2. FORMULARIO: validaciones
===================================================== */
function mostrarError(input, mensaje) {
    const mensajeError = input.closest(".campo-formulario")?.querySelector(".mensaje-error");
    if (mensajeError) mensajeError.textContent = mensaje;
    input.classList.toggle("input-invalido", Boolean(mensaje));
}

function validarNombre() {
    const valor = inputNombre.value.trim();

    if (valor.length < 3) {
        mostrarError(inputNombre, "Escribe tu nombre completo (mínimo 3 letras).");
        return false;
    }

    mostrarError(inputNombre, "");
    return true;
}

function validarCorreo() {
    const valor = inputCorreo.value.trim();
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

    if (!formatoValido) {
        mostrarError(inputCorreo, "Escribe un correo válido (ej. nombre@correo.com).");
        return false;
    }

    mostrarError(inputCorreo, "");
    return true;
}

function validarFormularioReserva() {
    const nombreValido = validarNombre();
    const correoValido = validarCorreo();
    return nombreValido && correoValido;
}

/* Validación en tiempo real, mientras el usuario escribe. */
inputNombre.addEventListener("input", validarNombre);
inputCorreo.addEventListener("input", validarCorreo);

/* =====================================================
Guardar / leer reservas en localStorage
===================================================== */
function obtenerReservas() {
    const datos = localStorage.getItem(CLAVE_RESERVAS);
    return datos ? JSON.parse(datos) : [];
}

function guardarReservas(reservas) {
    localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
}

/* Convierte "2026-07-04" en "4 de julio de 2026" para que
se lea mejor en la tarjeta de "Mis reservas". */
function formatoFechaLegible(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });
}

/* =====================================================
Envío del formulario: valida, guarda la reserva y
vacía el carrito
===================================================== */
formReserva.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (obtenerCarrito().length === 0) {
        mensajeFormulario.textContent = "Tu carrito está vacío: agrega al menos un tour antes de reservar.";
        mensajeFormulario.className = "mensaje-formulario mensaje-error-formulario";
        return;
    }

    if (obtenerCarrito().some(item => !item.fecha)) {
        mensajeFormulario.textContent = "Elige la fecha de cada tour de tu carrito antes de confirmar.";
        mensajeFormulario.className = "mensaje-formulario mensaje-error-formulario";
        return;
    }

    if (!validarFormularioReserva()) {
        mensajeFormulario.textContent = "Revisa los campos marcados en rojo antes de continuar.";
        mensajeFormulario.className = "mensaje-formulario mensaje-error-formulario";
        return;
    }

    const carrito = obtenerCarrito();

    const items = carrito.map(item => {
        const tour = obtenerTourPorId(item.idTour);
        return {
            idTour: item.idTour,
            nombre: tour ? tour.nombre : "Tour no disponible",
            precio: tour ? tour.precio : 0,
            cantidad: item.cantidad,
            fecha: item.fecha,
            subtotal: tour ? tour.precio * item.cantidad : 0
        };
    });

    const total = items.reduce((suma, item) => suma + item.subtotal, 0);

    const nuevaReserva = {
        id: Date.now(),
        nombre: inputNombre.value.trim(),
        correo: inputCorreo.value.trim(),
        telefono: inputTelefono.value.trim(),
        mensaje: inputMensaje.value.trim(),
        items,
        total,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString()
    };

    const reservas = obtenerReservas();
    reservas.push(nuevaReserva);
    guardarReservas(reservas);

    // El carrito ya quedó registrado dentro de la reserva.
    guardarCarrito([]);
    actualizarContadorCarrito();

    mensajeFormulario.textContent =
        `¡Reserva confirmada! Total: ${formatoColones(total)}. Pronto te contactaremos.`;
    mensajeFormulario.className = "mensaje-formulario mensaje-exito-formulario";

    formReserva.reset();
    [inputNombre, inputCorreo].forEach(input => mostrarError(input, ""));

    pintarCarrito();
    pintarReservas();
});

/* =====================================================
3. MIS RESERVAS
===================================================== */
function pintarReservas() {
    const reservas = obtenerReservas();

    subtituloReservas.textContent =
        `${reservas.length} ${reservas.length === 1 ? "reserva guardada" : "reservas guardadas"}`;

    if (reservas.length === 0) {
        contenedorReservas.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-clipboard-list"></i>
                <p>Aún no tienes solicitudes. Explora los tours y arma tu próxima aventura.</p>
                <a href="tours.html" class="btn-clear">
                    <i class="fa-solid fa-binoculars"></i>
                    Ver tours
                </a>
            </div>`;
        return;
    }

    contenedorReservas.innerHTML = reservas.map(reserva => `
        <article class="reserva-card" data-id-reserva="${reserva.id}">
            <div class="reserva-card-header">
                <div>
                    <h3>${reserva.nombre}</h3>
                    <p class="reserva-fecha">
                        <i class="fa-regular fa-calendar"></i>
                        Solicitada el ${formatoFechaLegible(reserva.fechaCreacion.slice(0, 10))}
                    </p>
                </div>
                <span class="reserva-estado reserva-estado--${reserva.estado}">
                    ${reserva.estado === "confirmada" ? "Confirmada" : "Pendiente"}
                </span>
            </div>

            <ul class="reserva-items">
                ${reserva.items.map(item => `
                    <li>
                        ${item.cantidad} × ${item.nombre} —
                        ${formatoFechaLegible(item.fecha)} —
                        ${formatoColones(item.subtotal)}
                    </li>
                `).join("")}
            </ul>

            <div class="reserva-card-footer">
                <p class="reserva-total">Total: <strong>${formatoColones(reserva.total)}</strong></p>
                <div class="reserva-acciones">
                    ${reserva.estado !== "confirmada" ? `
                        <button type="button" class="btn-secundario btn-confirmar-reserva">
                            <i class="fa-solid fa-check"></i> Marcar confirmada
                        </button>` : ""}
                    <button type="button" class="btn-eliminar-reserva" aria-label="Eliminar esta reserva">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

/* Permite confirmar o eliminar una reserva */
contenedorReservas.addEventListener("click", (evento) => {
    const tarjeta = evento.target.closest(".reserva-card");
    if (!tarjeta) return;

    const idReserva = Number(tarjeta.dataset.idReserva);
    const reservas = obtenerReservas();

    if (evento.target.closest(".btn-eliminar-reserva")) {
        guardarReservas(reservas.filter(r => r.id !== idReserva));
        pintarReservas();
    } else if (evento.target.closest(".btn-confirmar-reserva")) {
        const reserva = reservas.find(r => r.id === idReserva);
        if (reserva) reserva.estado = "confirmada";
        guardarReservas(reservas);
        pintarReservas();
    }
});

/* Muestra la confirmación para eliminar todas las reservas */
btnLimpiarReservas.addEventListener("click", () => {
    if (obtenerReservas().length === 0) return;

    btnLimpiarReservas.hidden = true;
    confirmarLimpiarReservas.hidden = false;
});

btnCancelarLimpiar.addEventListener("click", () => {
    confirmarLimpiarReservas.hidden = true;
    btnLimpiarReservas.hidden = false;
});

btnConfirmarLimpiar.addEventListener("click", () => {
    guardarReservas([]);
    confirmarLimpiarReservas.hidden = true;
    btnLimpiarReservas.hidden = false;
    pintarReservas();
});

/* =====================================================
Inicio
===================================================== */
cargarTours();