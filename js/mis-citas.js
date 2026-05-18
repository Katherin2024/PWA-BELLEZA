/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getFirestore,
collection,
getDocs,
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
let historialHTML = "";

/* Recorrer citas */
snap.forEach(docSnap=>{

const cita =
docSnap.data();

const id =
docSnap.id;

/* Solo citas del usuario */
if(cita.usuario === user.email){

const activa =
cita.estado === "pendiente" ||
cita.estado === "aprobado";

const card = `
<div class="mis-cita-card">

<h3>${cita.servicio}</h3>

<p>📅 ${cita.fecha}</p>

<p>⏰ ${cita.hora}</p>

<p>📍 ${cita.direccion}</p>

<p class="estado-cita">
Estado:
${cita.estado || "pendiente"}
</p>

${
(
(cita.estado === "pendiente" ||
cita.estado === "aprobado")
&&
(
(new Date(`${cita.fecha}T${cita.hora}`) - new Date())
/
(1000 * 60 * 60)
> 3
)
)
?
`
<button
onclick="editarDireccion('${id}')">
Cambiar dirección 📍
</button>

<button
onclick="cancelarCita('${id}')">
Cancelar ❌
</button>
`
:
""
}

</div>
`;

if(activa){

html += card;

}else{

historialHTML += card;

}

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
contenedor.innerHTML = html;

document.getElementById(
"listaHistorial"
).innerHTML = historialHTML;

}

/* =========================================
MOSTRAR HISTORIAL
========================================= */
window.toggleHistorial = ()=>{

const historial =
document.getElementById("listaHistorial");

const boton =
document.getElementById("btnHistorial");

if(historial.style.display === "none"){

historial.style.display = "flex";

boton.innerText =
"Ocultar historial 📜";

}else{

historial.style.display = "none";

boton.innerText =
"Ver historial 📜";

}

};

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

/* BUSCAR CITA */
const citaSnap = await getDoc(
doc(db,"citas",id)
);

if(!citaSnap.exists()) return;

const cita = citaSnap.data();

/* VALIDAR ESTADO */
if(
cita.estado === "atendida" ||
cita.estado === "rechazado" ||
cita.estado === "cancelada"
){

alert(
"No puedes cambiar la dirección de esta cita ❌"
);

return;

}

/* VALIDAR TIEMPO */
const ahora = new Date();

const fechaHoraCita =
new Date(`${cita.fecha}T${cita.hora}`);

const diferenciaHoras =
(fechaHoraCita - ahora) / (1000 * 60 * 60);

if(diferenciaHoras <= 3){

alert(
"Solo puedes cambiar dirección con mínimo 3 horas de anticipación ⏰"
);

return;

}

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

/* CAMBIARLA */
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
WHATSAPP
========================================= */
function abrirWhatsApp(link){

const esMovil =
/Android|iPhone|iPad|iPod/i.test(
navigator.userAgent
);

if(esMovil){

window.location.href = link;

}else{

window.open(link,"_blank");

}

}

/* =========================================
CANCELAR CITA
========================================= */
window.cancelarCita = async(id)=>{

/* Buscar cita */
const snap = await getDoc(
doc(db,"citas",id)
);

if(!snap.exists()) return;

const cita = snap.data();

/* VALIDAR ESTADO */
if(
cita.estado === "atendida" ||
cita.estado === "rechazado" ||
cita.estado === "cancelada"
){

alert(
"Esta cita ya no puede cancelarse ❌"
);

return;

}

/* VALIDAR TIEMPO */
const ahora = new Date();

const fechaHoraCita =
new Date(`${cita.fecha}T${cita.hora}`);

const diferenciaHoras =
(fechaHoraCita - ahora) / (1000 * 60 * 60);

/* MENOS DE 3 HORAS */
if(diferenciaHoras <= 3){

alert(
"Solo puedes cancelar con mínimo 3 horas de anticipación ⏰"
);

return;

}

/* CONFIRMAR */
const confirmar = confirm(
"¿Cancelar esta cita?"
);

if(!confirmar) return;

/* CAMBIAR ESTADO */
await updateDoc(
doc(db,"citas",id),
{
estado:"cancelada"
}
);

/* MENSAJE ADMIN */
const mensaje =
encodeURIComponent(
`⚠️ CANCELACIÓN DE CITA

👤 Cliente: ${cita.usuario}

💅 Servicio: ${cita.servicio}

📅 Fecha: ${cita.fecha}

⏰ Hora: ${cita.hora}`
);

/* TU NUMERO */
const telefonoAdmin =
"573227257705";

/* ABRIR WHATSAPP */
abrirWhatsApp(
`https://wa.me/${telefonoAdmin}?text=${mensaje}`
);

/* CAMBIAR ESTADO */
await updateDoc(
doc(db,"citas",id),
{
estado:"cancelada"
}
);

location.reload();

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"servicios.html";

};