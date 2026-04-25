/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getFirestore,
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
getAuth
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

/* Configuración */
import { app }
from "./firebase-config.js";

/* =========================================
INICIALIZAR
========================================= */
const db =
getFirestore(app);

const auth =
getAuth(app);

/* =========================================
OBTENER CATEGORÍA
========================================= */
const categoria =
localStorage.getItem("categoria");

/* =========================================
TÍTULO DINÁMICO
========================================= */
const titulo =
document.getElementById("titulo");

if(categoria === "uñas"){
titulo.innerText =
"💅 Tratamientos de manos y pies";
}

if(categoria === "depilacion"){
titulo.innerText =
"🪒 Depilación facial y corporal";
}

if(categoria === "cejas"){
titulo.innerText =
"👁️ Tratamientos de cejas";
}

if(categoria === "pestañas"){
titulo.innerText =
"✨ Tratamientos de pestañas";
}

if(categoria === "maquillaje"){
titulo.innerText =
"✨ Maquillaje Profesional";
}

/* =========================================
CARGAR SERVICIOS
========================================= */
const contenedor =
document.getElementById("listaServicios");

/* Consultar Firebase */
const querySnapshot =
await getDocs(
collection(db,"servicios")
);

let html = "";

/* Filtrar por categoría */
querySnapshot.forEach(docSnap=>{

const s =
docSnap.data();

if(s.categoria === categoria){

html += `
<div class="servicio">

<h3>${s.nombre}</h3>

<p>💰 $${s.precio}</p>

<p>⏱ ${s.duracion}</p>

<button onclick="agendar(
'${s.nombre}',
'${s.duracion}',
'${s.precio}'
)">
Agendar
</button>

</div>
`;

}

});

/* Si no hay servicios */
if(html === ""){

html =
"<p style='text-align:center;'>No hay servicios disponibles 💔</p>";

}

/* Mostrar */
contenedor.innerHTML =
html;

/* =========================================
VALIDAR LOGIN Y AGENDAR
========================================= */
window.agendar =
(nombre, duracion, precio)=>{

const user =
auth.currentUser;

/* Si no está logueado */
if(!user){

alert(
"Debes iniciar sesión para agendar 📅"
);

window.location.href =
"login.html";

return;

}

/* Guardar datos */
localStorage.setItem("servicio", nombre);
localStorage.setItem("duracion", duracion);
localStorage.setItem("precio", precio);

/* Ir a agendar */
window.location.href =
"agendar.html";

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"servicios.html";

};