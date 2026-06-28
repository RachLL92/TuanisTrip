/* =====================================================
carrito.js
Lógica COMPARTIDA del carrito de compras.
El botón "Agregar al carrito" solo existe en
tours.html, pero el contador del header (ícono del
carrito) puede aparecer en cualquier página, por eso
este archivo es independiente de favoritos.js.
===================================================== */

/* Nombre de la clave utilizada para guardar el carrito */
const CLAVE_CARRITO = "tuanisTripCarrito";

/* Obtiene el carrito almacenado en localStorage */
function obtenerCarrito() {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    /* Obtiene el carrito almacenado en localStorage */
    return datos ? JSON.parse(datos) : [];
}

/* Guarda el carrito actualizado en localStorage */
function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

/* Agrega un tour al carrito o aumenta su cantidad si ya existe */
function agregarAlCarrito(idTour) {
    const carrito = obtenerCarrito();
    /* Busca si el tour ya fue agregado anteriormente */
    const item = carrito.find(i => i.idTour === idTour);

    if (item) {
        /* Incrementa la cantidad del tour */
        item.cantidad += 1;
    } else {
        /* Agrega un nuevo tour al carrito */
        carrito.push({ idTour, cantidad: 1, fecha: "" });
    }

    /* Guarda los cambios y actualiza el contador */
    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

/* Calcula la cantidad total de tours agregados */
function totalArticulosCarrito() {
    return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

/* Actualiza el número que aparece sobre el ícono del carrito */
function actualizarContadorCarrito() {
    const contador = document.querySelector(".carrito-contador");
    /* Si el contador no existe en la página, no hace nada */
    if (!contador) return;

    const total = totalArticulosCarrito();
    /* Muestra la cantidad de artículos */
    contador.textContent = total;
    /* Muestra u oculta la burbuja según haya productos */
    contador.classList.toggle("visible", total > 0);
}

/* Muestra una confirmación visual cuando un tour se agrega al carrito */
function confirmarAgregadoAlCarrito(boton) {
    /* Guarda el contenido original del botón */
    const textoOriginal = boton.innerHTML;
    /* Cambia temporalmente el estilo y el texto */
    boton.classList.add("agregado");
    boton.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';

    /* Después de un momento restaura el botón */
    setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove("agregado");
    }, 1200);
}

/* Detecta los clics sobre los botones "Agregar al carrito" */
document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-carrito-tour");
    /* Si no es un botón válido o está deshabilitado, termina */
    if (!boton || boton.disabled) return;

    /* Obtiene el id del tour seleccionado */
    const idTour = Number(boton.dataset.tourId);
    /* Agrega el tour al carrito */
    agregarAlCarrito(idTour);
    /* Muestra la confirmación visual */
    confirmarAgregadoAlCarrito(boton);
});

/* Actualiza el contador cuando la página termina de cargar */
document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);