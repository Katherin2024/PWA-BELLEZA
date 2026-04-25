/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getFirestore,
collection,
getDocs,
deleteDoc,
updateDoc,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

/* Configuración principal */
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
CARGAR CITAS
========================================= */
async function cargarCitas(user){

const contenedor =
document.getElementById("listaCitas");

/* Consultar citas */
const snap =
await getDocs(
collection(db,"citas")
);

let html = "";

/* Recorrer citas */
snap.forEach(docSnap=>{

const cita =
docSnap.data();

const id =
docSnap.id;

/* Solo citas del usuario */
if(cita.usuario === user.email){

html += `
<div class="mis-cita-card">

<h3>${cita.servicio}</h3>

<p>📅 ${cita.fecha}</p>

<p>⏰ ${cita.hora}</p>

<p>📍 ${cita.direccion}</p>

<p class="estado-cita">
Estado:
${cita.estado || "pendiente"}
</p>

<button
onclick="editarDireccion('${id}')">
Cambiar dirección 📍
</button>

<button
onclick="cancelarCita('${id}')">
Cancelar ❌
</button>

</div>
`;

}

});

/* Si no tiene citas */
if(html === ""){

html = `
<div class="mis-cita-card">

<h3>No tienes citas 💔</h3>

<p>
Agenda una nueva cita cuando quieras.
</p>

</div>
`;

}

/* Mostrar */
contenedor.innerHTML =
html;

}

/* =========================================
VALIDAR LOGIN
========================================= */
onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

cargarCitas(user);

});

/* =========================================
CAMBIAR DIRECCIÓN
========================================= */
window.editarDireccion =
async(id)=>{

const user =
auth.currentUser;

/* Buscar usuario */
const snap =
await getDoc(
doc(db,"usuarios",user.uid)
);

if(!snap.exists()) return;

const data =
snap.data();

let opciones = [];

/* Guardar direcciones */
if(data.direccion1){
opciones.push(data.direccion1);
}

if(data.direccion2){
opciones.push(data.direccion2);
}

/* Sin direcciones */
if(opciones.length === 0){

alert(
"No tienes direcciones guardadas"
);

return;

}

/* Solicitar nueva */
const nueva =
prompt(
"Escribe exactamente una de estas direcciones:\n\n" +
opciones.join("\n")
);

if(!nueva) return;

/* Validar */
if(!opciones.includes(nueva)){

alert(
"Dirección no válida ⚠️"
);

return;

}

/* Actualizar */
await updateDoc(
doc(db,"citas",id),
{
direccion:nueva
}
);

alert(
"Dirección actualizada 💖"
);

location.reload();

};

/* =========================================
CANCELAR CITA
========================================= */
window.cancelarCita =
async(id)=>{

const confirmar =
confirm(
"¿Cancelar esta cita?"
);

if(!confirmar) return;

/* Eliminar */
await deleteDoc(
doc(db,"citas",id)
);

alert(
"Cita cancelada 💔"
);

location.reload();

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"index.html";

};