/* =====================================================
carrito.js
Lógica COMPARTIDA del carrito de compras.
El botón "Agregar al carrito" solo existe en
tours.html, pero el contador del header (ícono del
carrito) puede aparecer en cualquier página, por eso
este archivo es independiente de favoritos.js.

Guarda en localStorage un arreglo de objetos:
[{ idTour: 1, cantidad: 2 }, { idTour: 5, cantidad: 1 }]
===================================================== */

const CLAVE_CARRITO = "tuanisTripCarrito";

function obtenerCarrito() {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

/* Suma 1 al tour indicado (o lo agrega si no estaba). */
function agregarAlCarrito(idTour) {
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.idTour === idTour);

    if (item) {
        item.cantidad += 1;
    } else {
        carrito.push({ idTour, cantidad: 1 });
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

/* Cantidad total de tours en el carrito (suma cantidades,
no solo la cantidad de filas distintas). */
function totalArticulosCarrito() {
    return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

/* Actualiza la burbuja numérica junto al ícono del carrito
en el header. Si el contador no existe en esta página
(porque el header todavía no lo tiene), no hace nada. */
function actualizarContadorCarrito() {
    const contador = document.querySelector(".carrito-contador");
    if (!contador) return;

    const total = totalArticulosCarrito();
    contador.textContent = total;
    contador.classList.toggle("visible", total > 0);
}

/* Pequeña confirmación visual sobre el propio botón que se
presionó, sin usar alert() ni recargar la página. */
function confirmarAgregadoAlCarrito(boton) {
    const textoOriginal = boton.innerHTML;
    boton.classList.add("agregado");
    boton.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';

    setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove("agregado");
    }, 1200);
}

document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-carrito-tour");
    if (!boton || boton.disabled) return;

    const idTour = Number(boton.dataset.tourId);
    agregarAlCarrito(idTour);
    confirmarAgregadoAlCarrito(boton);
});

document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);
