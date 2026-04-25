/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getAuth,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
updateDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/* Configuración principal */
import { app }
from "./firebase-config.js";

/* =========================================
INICIALIZAR
========================================= */
const auth =
getAuth(app);

const db =
getFirestore(app);

/* UID usuario */
let uid = "";

/* =========================================
CARGAR DATOS USUARIO
========================================= */
onAuthStateChanged(auth, async(user)=>{

/* Si no hay sesión */
if(!user){

window.location.href =
"login.html";

return;

}

/* Guardar uid */
uid = user.uid;

/* Buscar datos */
const snap =
await getDoc(
doc(db,"usuarios",uid)
);

/* Si existe */
if(snap.exists()){

const data =
snap.data();

/* Pintar campos */
document.getElementById("nombre").value =
data.nombre || "";

document.getElementById("telefono").value =
data.telefono || "";

document.getElementById("direccion1").value =
data.direccion1 || "";

document.getElementById("direccion2").value =
data.direccion2 || "";

}

});

/* =========================================
GUARDAR CAMBIOS
========================================= */
window.guardarCambios =
async()=>{

/* Actualizar Firebase */
await updateDoc(
doc(db,"usuarios",uid),
{
nombre:
document.getElementById("nombre").value,

telefono:
document.getElementById("telefono").value,

direccion1:
document.getElementById("direccion1").value,

direccion2:
document.getElementById("direccion2").value
}
);

/* Mensaje */
alert(
"Datos actualizados 💖"
);

/* Redirección */
window.location.href =
"index.html";

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"index.html";

};