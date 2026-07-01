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

/* Referencias al panel de advertencia del formulario (paso 2) */
const accionesFormStep1 = document.getElementById("accionesFormStep1");
const panelAdvertenciaForm = document.getElementById("panelAdvertenciaForm");
const btnConfirmarReservaFinal = document.getElementById("btnConfirmarReservaFinal");
const btnCancelarAdvertenciaForm = document.getElementById("btnCancelarAdvertenciaForm");

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

    /* Respaldo: si por alguna razón el carrito ya tenía dos
    tours guardados con la misma fecha (por ejemplo, de antes
    de aplicar esta regla), tampoco se deja confirmar. */
    const fechasUsadas = carrito.map(item => item.fecha).filter(Boolean);
    const hayFechasRepetidas = new Set(fechasUsadas).size !== fechasUsadas.length;

    btnConfirmarReserva.disabled = carrito.length === 0 || faltaFecha || hayFechasRepetidas;
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
                    <p class="mensaje-error mensaje-error-fecha" aria-live="polite"></p>
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

            const mensajeErrorFecha = input.closest(".item-carrito-info")?.querySelector(".mensaje-error-fecha");

            // Regla: dos tours distintos del carrito no pueden compartir la
            // misma fecha de viaje (cada uno necesita su propio día).
            const fechaYaUsadaPorOtroTour = input.value && carritoActual.some(
                otro => otro.idTour !== idTour && otro.fecha === input.value
            );

            if (fechaYaUsadaPorOtroTour) {
                const tourEnConflicto = obtenerTourPorId(
                    carritoActual.find(otro => otro.idTour !== idTour && otro.fecha === input.value).idTour
                );

                if (mensajeErrorFecha) {
                    mensajeErrorFecha.textContent =
                        `Esa fecha ya la usa "${tourEnConflicto ? tourEnConflicto.nombre : "otro tour"}". Elige un día distinto para cada tour.`;
                }
                input.classList.add("input-invalido");

                // No se guarda la fecha en conflicto: el input vuelve a
                // mostrar la última fecha válida que tenía este tour.
                input.value = itemActual.fecha || "";
                actualizarEstadoBotonConfirmar();
                return;
            }

            if (mensajeErrorFecha) mensajeErrorFecha.textContent = "";

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

function validarTelefono() {
    /* Acepta 8 dígitos, con o sin guion en medio (8888-8888 u 88888888) */
    const valor = inputTelefono.value.trim();
    const formatoValido = /^\d{4}-?\d{4}$/.test(valor);

    if (!formatoValido) {
        mostrarError(inputTelefono, "Escribe un teléfono válido de 8 dígitos (ej. 8888-8888).");
        return false;
    }

    mostrarError(inputTelefono, "");
    return true;
}

function validarFormularioReserva() {
    const nombreValido = validarNombre();
    const correoValido = validarCorreo();
    const telefonoValido = validarTelefono();
    return nombreValido && correoValido && telefonoValido;
}

/* Validación en tiempo real, mientras el usuario escribe. */
inputNombre.addEventListener("input", () => { mensajeFormulario.textContent = ""; validarNombre(); });
inputCorreo.addEventListener("input", () => { mensajeFormulario.textContent = ""; validarCorreo(); });
inputTelefono.addEventListener("input", () => { mensajeFormulario.textContent = ""; validarTelefono(); });

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

/* Convierte "2026-07-04" en "4 de julio de 2026" */
function formatoFechaLegible(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });
}

/* Convierte "2026-07-04" en "sábado, 4 de julio de 2026" (con día de la semana) */
function formatoFechaConDia(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const texto = fecha.toLocaleDateString("es-CR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    // Capitaliza la primera letra
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* =====================================================
3. MIS RESERVAS
===================================================== */
function pintarReservas() {
    const reservas = obtenerReservas();

    subtituloReservas.textContent =
        `${reservas.length} ${reservas.length === 1 ? "reserva guardada" : "reservas guardadas"}`;

    btnLimpiarReservas.hidden = reservas.length === 0;
    confirmarLimpiarReservas.hidden = true;

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
        <section class="reserva-grupo" data-id-reserva="${reserva.id}">

            <!-- Encabezado del grupo -->
            <div class="reserva-grupo-header">
                <div>
                    <p class="reserva-grupo-cliente">
                        <i class="fa-solid fa-user"></i> ${reserva.nombre}
                    </p>
                    <p class="reserva-grupo-fecha">
                        <i class="fa-regular fa-calendar"></i>
                        Solicitada el ${formatoFechaLegible(reserva.fechaCreacion.slice(0, 10))}
                    </p>
                </div>
                <p class="reserva-grupo-total">Total: <strong>${formatoColones(reserva.total)}</strong></p>
            </div>

            <!-- Una tarjeta por cada tour dentro de la reserva -->
            ${reserva.items.map((item, index) => {
                const tour = obtenerTourPorId(item.idTour);
                const imgSrc = tour ? tour.imagen : "";
                return `
                <article class="reserva-item-card" data-index="${index}">

                    <!-- Fila principal: imagen + info + acciones -->
                    <div class="reserva-item-main">
                        <img src="${imgSrc}" alt="${item.nombre}" class="reserva-item-img">

                        <div class="reserva-item-info">
                            <h4 class="reserva-item-nombre">${item.nombre}</h4>
                            <p class="reserva-item-fecha">
                                <i class="fa-regular fa-calendar-days"></i>
                                ${formatoFechaConDia(item.fecha)}
                            </p>
                            <p class="reserva-item-meta">
                                <span>
                                    <i class="fa-solid fa-user-group"></i>
                                    ${item.cantidad} ${item.cantidad === 1 ? "persona" : "personas"}
                                </span>
                                <span class="reserva-item-precio">${formatoColones(item.subtotal)}</span>
                            </p>
                        </div>

                        <div class="reserva-item-derecha">
                            <span class="reserva-estado reserva-estado--${reserva.estado}">
                                ${reserva.estado === "confirmada" ? "Confirmada" : "Pendiente"}
                            </span>
                            <div class="reserva-item-acciones">
                                <button type="button" class="btn-secundario btn-abrir-modificar"
                                        data-index="${index}">
                                    <i class="fa-solid fa-pencil"></i> Modificar
                                </button>
                                <button type="button" class="btn-cancelar-tour-btn"
                                        data-index="${index}">
                                    <i class="fa-solid fa-trash-can"></i> Cancelar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ==============================================
                    PANEL MODIFICAR (2 pasos: formulario → confirmación)
                    ============================================== -->
                    <div class="panel-reserva-advertencia panel-modificar-tour" hidden>

                        <!-- Paso 1: formulario de fecha y personas -->
                        <div class="paso-form-modificar">
                            <p class="panel-modificar-titulo">
                                <i class="fa-solid fa-pencil"></i>
                                Modificar: "${item.nombre}"
                            </p>
                            <div class="panel-modificar-campos">
                                <label class="item-carrito-fecha-label">
                                    Nueva fecha
                                    <input type="date"
                                           class="input-fecha-modificar input-fecha-item"
                                           value="${item.fecha}">
                                </label>
                                <label class="campo-cantidad-modificar-label">
                                    Personas
                                    <div class="panel-cantidad-control">
                                        <button type="button" class="btn-cantidad btn-restar-modificar">−</button>
                                        <span class="cantidad-modificar">${item.cantidad}</span>
                                        <button type="button" class="btn-cantidad btn-sumar-modificar">+</button>
                                    </div>
                                </label>
                            </div>
                            <p class="panel-modificar-error mensaje-error" aria-live="polite"></p>
                            <div class="panel-reserva-botones">
                                <!-- "Guardar cambios" valida y pasa al paso 2 -->
                                <button type="button" class="btn-clear btn-ir-a-confirmar-modificar">
                                    <i class="fa-solid fa-floppy-disk"></i> Guardar cambios
                                </button>
                                <button type="button" class="btn-secundario btn-cerrar-modificar">
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <!-- Paso 2: advertencia antes de guardar -->
                        <div class="paso-confirm-modificar" hidden>
                            <p>
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                ¿Confirmar los cambios en este tour?
                            </p>
                            <div class="panel-reserva-botones">
                                <button type="button" class="btn-clear btn-confirmar-guardar-modificar">
                                    <i class="fa-solid fa-check"></i> Sí, guardar cambios
                                </button>
                                <button type="button" class="btn-secundario btn-volver-modificar">
                                    Volver
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- ==============================================
                    PANEL CANCELAR TOUR (advertencia con cargo del 20%)
                    ============================================== -->
                    <div class="panel-reserva-advertencia panel-cancelar-tour" hidden>
                        <p>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            ¿Cancelar "${item.nombre}"? Si la reserva ya fue procesada se aplicará un cargo del 20% (${formatoColones(Math.round(item.subtotal * 0.2))}).
                        </p>
                        <div class="panel-reserva-botones">
                            <button type="button" class="btn-clear btn-peligro btn-cancelar-tour-si">
                                Sí, cancelar
                            </button>
                            <button type="button" class="btn-secundario btn-cancelar-tour-no">
                                Mantener
                            </button>
                        </div>
                    </div>

                </article>`;
            }).join("")}

        </section>
    `).join("");

    /* Aplica restricción de fechas pasadas a todos los inputs de modificar */
    document.querySelectorAll(".input-fecha-modificar").forEach(input => {
        impedirFechasPasadas(input);
    });
}

/* =====================================================
Listener unificado para "Mis reservas"
Maneja: confirmar, eliminar, modificar (2 pasos) y cancelar tours
===================================================== */
contenedorReservas.addEventListener("click", (evento) => {
    const grupo = evento.target.closest(".reserva-grupo");
    if (!grupo) return;

    const idReserva = Number(grupo.dataset.idReserva);
    const itemCard = evento.target.closest(".reserva-item-card");
    const index = itemCard ? Number(itemCard.dataset.index) : null;

    /* Cierra todos los paneles del item card y resetea
    el panel de modificar al paso 1 */
    const cerrarPanelesItem = () => {
        if (!itemCard) return;
        itemCard.querySelectorAll(".panel-reserva-advertencia").forEach(p => {
            p.hidden = true;
        });
        const pasoForm = itemCard.querySelector(".paso-form-modificar");
        const pasoConfirm = itemCard.querySelector(".paso-confirm-modificar");
        if (pasoForm) pasoForm.hidden = false;
        if (pasoConfirm) pasoConfirm.hidden = true;
        const errorPanel = itemCard.querySelector(".panel-modificar-error");
        if (errorPanel) errorPanel.textContent = "";
    };

    /* Cierra los paneles del footer del grupo */
    const cerrarPanelesFooter = () => {
        grupo.querySelectorAll(".panel-eliminar-reserva")
            .forEach(p => p.hidden = true);
    };

    /* ============================================
    ACCIONES DEL FOOTER (reserva completa)
    ============================================ */

    /* Abrir panel de ELIMINAR reserva completa */
    if (evento.target.closest(".btn-abrir-eliminar-reserva")) {
        cerrarPanelesFooter();
        grupo.querySelector(".panel-eliminar-reserva").hidden = false;
        return;
    }

    /* Eliminar reserva — SÍ */
    if (evento.target.closest(".btn-eliminar-reserva-si")) {
        guardarReservas(obtenerReservas().filter(r => r.id !== idReserva));
        pintarReservas();
        return;
    }

    /* Eliminar reserva — NO */
    if (evento.target.closest(".btn-eliminar-reserva-no")) {
        grupo.querySelector(".panel-eliminar-reserva").hidden = true;
        return;
    }

    /* ============================================
    ACCIONES POR TOUR INDIVIDUAL
    ============================================ */
    if (!itemCard) return;

    /* ABRIR panel de MODIFICAR (paso 1) */
    if (evento.target.closest(".btn-abrir-modificar")) {
        cerrarPanelesItem();
        itemCard.querySelector(".panel-modificar-tour").hidden = false;
        return;
    }

    /* CERRAR panel de modificar sin guardar */
    if (evento.target.closest(".btn-cerrar-modificar")) {
        cerrarPanelesItem();
        return;
    }

    /* Controles de cantidad (paso 1 de modificar) */
    if (evento.target.closest(".btn-sumar-modificar")) {
        const span = itemCard.querySelector(".cantidad-modificar");
        span.textContent = Number(span.textContent) + 1;
        return;
    }

    if (evento.target.closest(".btn-restar-modificar")) {
        const span = itemCard.querySelector(".cantidad-modificar");
        const actual = Number(span.textContent);
        if (actual > 1) span.textContent = actual - 1;
        return;
    }

    /* GUARDAR CAMBIOS → valida y pasa al paso 2 (confirmación) */
    if (evento.target.closest(".btn-ir-a-confirmar-modificar")) {
        const nuevaFecha = itemCard.querySelector(".input-fecha-modificar").value;
        const nuevaCantidad = Number(itemCard.querySelector(".cantidad-modificar").textContent);
        const errorPanel = itemCard.querySelector(".panel-modificar-error");

        /* Validaciones antes de pasar al paso 2 */
        if (!nuevaFecha) {
            errorPanel.textContent = "Selecciona una fecha para este tour.";
            return;
        }

        const reservas = obtenerReservas();
        const reserva = reservas.find(r => r.id === idReserva);
        if (!reserva) return;

        const fechaOcupada = reserva.items.some(
            (it, i) => i !== index && it.fecha === nuevaFecha
        );

        if (fechaOcupada) {
            errorPanel.textContent = "Esa fecha ya la usa otro tour de esta reserva. Elige un día diferente.";
            return;
        }

        /* Todo válido → guarda los valores en el paso 2 y lo muestra */
        const pasoConfirm = itemCard.querySelector(".paso-confirm-modificar");
        pasoConfirm.dataset.nuevaFecha = nuevaFecha;
        pasoConfirm.dataset.nuevaCantidad = nuevaCantidad;

        itemCard.querySelector(".paso-form-modificar").hidden = true;
        pasoConfirm.hidden = false;
        errorPanel.textContent = "";
        return;
    }

    /* VOLVER al paso 1 desde la confirmación */
    if (evento.target.closest(".btn-volver-modificar")) {
        itemCard.querySelector(".paso-form-modificar").hidden = false;
        itemCard.querySelector(".paso-confirm-modificar").hidden = true;
        return;
    }

    /* SÍ GUARDAR — aplica los cambios en localStorage */
    if (evento.target.closest(".btn-confirmar-guardar-modificar")) {
        const pasoConfirm = itemCard.querySelector(".paso-confirm-modificar");
        const nuevaFecha = pasoConfirm.dataset.nuevaFecha;
        const nuevaCantidad = Number(pasoConfirm.dataset.nuevaCantidad);

        const reservas = obtenerReservas();
        const reserva = reservas.find(r => r.id === idReserva);
        if (!reserva) return;

        const tour = obtenerTourPorId(reserva.items[index].idTour);
        reserva.items[index].fecha = nuevaFecha;
        reserva.items[index].cantidad = nuevaCantidad;
        reserva.items[index].subtotal = tour
            ? tour.precio * nuevaCantidad
            : reserva.items[index].subtotal;

        reserva.total = reserva.items.reduce((suma, it) => suma + it.subtotal, 0);

        guardarReservas(reservas);
        pintarReservas();
        return;
    }

    /* ABRIR panel de CANCELAR tour */
    if (evento.target.closest(".btn-cancelar-tour-btn")) {
        cerrarPanelesItem();
        itemCard.querySelector(".panel-cancelar-tour").hidden = false;
        return;
    }

    /* Cancelar tour — SÍ */
    if (evento.target.closest(".btn-cancelar-tour-si")) {
        const reservas = obtenerReservas();
        const reserva = reservas.find(r => r.id === idReserva);
        if (!reserva) return;

        reserva.items.splice(index, 1);

        if (reserva.items.length === 0) {
            guardarReservas(reservas.filter(r => r.id !== idReserva));
        } else {
            reserva.total = reserva.items.reduce((suma, it) => suma + it.subtotal, 0);
            guardarReservas(reservas);
        }

        pintarReservas();
        return;
    }

    /* Cancelar tour — NO */
    if (evento.target.closest(".btn-cancelar-tour-no")) {
        itemCard.querySelector(".panel-cancelar-tour").hidden = true;
    }
});
/* =====================================================
FORMULARIO: flujo de 2 pasos
Paso 1: "Confirmar reserva" → valida → muestra advertencia
Paso 2: "Sí, confirmar" → guarda la reserva como confirmada
===================================================== */

/* Paso 1 — valida y abre el panel de advertencia */
btnConfirmarReserva.addEventListener("click", () => {
    mensajeFormulario.textContent = "";

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

    const fechasDelCarrito = obtenerCarrito().map(item => item.fecha);
    if (new Set(fechasDelCarrito).size !== fechasDelCarrito.length) {
        mensajeFormulario.textContent = "Dos tours no pueden reservarse para la misma fecha.";
        mensajeFormulario.className = "mensaje-formulario mensaje-error-formulario";
        return;
    }

    if (!validarFormularioReserva()) {
        mensajeFormulario.textContent = "Revisa los campos marcados en rojo antes de continuar.";
        mensajeFormulario.className = "mensaje-formulario mensaje-error-formulario";
        return;
    }

    /* Todo válido → ocultar el botón y mostrar la advertencia */
    accionesFormStep1.hidden = true;
    panelAdvertenciaForm.hidden = false;
});

/* Cancelar la advertencia → volver al botón */
btnCancelarAdvertenciaForm.addEventListener("click", () => {
    panelAdvertenciaForm.hidden = true;
    accionesFormStep1.hidden = false;
});

/* Paso 2 — guardar la reserva como CONFIRMADA */
btnConfirmarReservaFinal.addEventListener("click", () => {
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

    /* La reserva se crea directamente como "confirmada":
    el usuario ya pasó por el paso de advertencia. */
    const nuevaReserva = {
        id: Date.now(),
        nombre: inputNombre.value.trim(),
        correo: inputCorreo.value.trim(),
        telefono: inputTelefono.value.trim(),
        mensaje: inputMensaje.value.trim(),
        items,
        total,
        estado: "confirmada",
        fechaCreacion: new Date().toISOString()
    };

    const reservas = obtenerReservas();
    reservas.push(nuevaReserva);
    guardarReservas(reservas);

    guardarCarrito([]);
    actualizarContadorCarrito();

    /* Restaura el formulario a su estado inicial */
    panelAdvertenciaForm.hidden = true;
    accionesFormStep1.hidden = false;
    formReserva.reset();
    [inputNombre, inputCorreo, inputTelefono].forEach(input => mostrarError(input, ""));

    pintarCarrito();
    pintarReservas();
});

/* =====================================================
/* =====================================================
Muestra la confirmación para eliminar todas las reservas
===================================================== */
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