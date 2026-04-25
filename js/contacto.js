/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getFirestore,
collection,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/* Configuración principal */
import { app }
from "./firebase-config.js";

/* =========================================
INICIALIZAR
========================================= */
const db =
getFirestore(app);

/* =========================================
ENVIAR MENSAJE
========================================= */
window.enviarMensaje =
async()=>{

/* Capturar campos */
const nombre =
document.getElementById("nombre")
.value
.trim();

const correo =
document.getElementById("correo")
.value
.trim();

const mensaje =
document.getElementById("mensaje")
.value
.trim();

/* Validar campos */
if(
!nombre ||
!correo ||
!mensaje
){

alert(
"Completa todos los campos ⚠️"
);

return;

}

try{

/* Guardar en Firebase */
await addDoc(
collection(db,"contactos"),
{
nombre:nombre,
correo:correo,
mensaje:mensaje,
fecha:new Date().toLocaleDateString(),
hora:new Date().toLocaleTimeString()
}
);

/* Confirmación */
alert(
"Mensaje enviado con éxito 💖"
);

/* Limpiar formulario */
document.getElementById("nombre").value = "";
document.getElementById("correo").value = "";
document.getElementById("mensaje").value = "";

}catch(error){

alert(
"Error: " +
error.message
);

}

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"index.html";

};
