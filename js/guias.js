// ======================================================
// Información de guías turísticos
// Este archivo carga los datos desde guias.json
// y crea las tarjetas de forma dinámica.
// ======================================================

// Arreglo donde se guardarán los guías
let guias = [];

// Contenedor donde se mostrarán las tarjetas
const contenedorGuias = document.getElementById("contenedorGuias");

// ------------------------------------------------------
// Cargar los datos del archivo JSON
// ------------------------------------------------------

async function cargarGuias() {

    try {
        
        const respuesta = await fetch("data/guias.json");
        
        guias = await respuesta.json();
        
        mostrarGuias(guias);
    }
    
    catch (error) {
        
        console.error("Error al cargar los guías:", error);
    }
}

// ------------------------------------------------------
// Mostrar las tarjetas de los guías
// ------------------------------------------------------

function mostrarGuias(listaGuias) {
    
    // Limpia el contenedor antes de volver a pintar
    contenedorGuias.innerHTML = "";
    
    listaGuias.forEach(guia => {
        
        const tarjeta = document.createElement("article");
        
        tarjeta.classList.add("guia-card");
        
        tarjeta.innerHTML = `
        
            <img src="${guia.imagen}" alt="${guia.nombre}">
            
            <div class="guia-info">
            
                <h3>${guia.nombre}</h3>
                
                <p><strong>Categoría:</strong> ${guia.categoria}</p>
                
                <p><strong>Especialidad:</strong> ${guia.especialidad}</p>
                
                <p><strong>Idiomas:</strong> ${guia.idiomas.join(", ")}</p>
                
                <p><strong>Experiencia:</strong> ${guia.experiencia} años</p>
                
                <p><strong>Calificación:</strong> ⭐ ${guia.calificacion}</p>
                
            </div>
            
        `;
        
        contenedorGuias.appendChild(tarjeta);
    });

}

// ------------------------------------------------------
// Iniciar la carga de los datos
// ------------------------------------------------------

cargarGuias();

// ------------------------------------------------------
// Filtrar guías
// ------------------------------------------------------

const btnBuscarGuias = document.getElementById("btnBuscarGuias");

btnBuscarGuias.addEventListener("click", () => {
    
    const categoria = document.getElementById("categoria").value;
    const especialidad = document.getElementById("especialidad").value;
    const idioma = document.getElementById("idioma").value;
    
    const resultado = guias.filter(guia => {
        
        const coincideCategoria =
            categoria === "" || guia.categoria === categoria;
            
            const coincideEspecialidad =
            especialidad === "" || guia.especialidad === especialidad;
            
            const coincideIdioma =
            idioma === "" || guia.idiomas.includes(idioma);
            
            return coincideCategoria &&
                coincideEspecialidad &&
                coincideIdioma;

    });
    
    mostrarGuias(resultado);
});