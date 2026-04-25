/* =========================================
IR A CATEGORÍA
========================================= */
window.irCategoria = (categoria)=>{

/* Guardar categoría */
localStorage.setItem(
"categoria",
categoria
);

/* Redirigir */
window.location.href =
"categoria.html";

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"index.html";

};