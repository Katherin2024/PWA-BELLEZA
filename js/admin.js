/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getFirestore,
collection,
getDocs,
addDoc,
deleteDoc,
doc,
updateDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged,
signOut
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

/* Importar configuración principal */
import { app }
from "./firebase-config.js";

/* =========================================
INICIALIZAR FIREBASE
========================================= */

/* Base de datos */
const db =
getFirestore(app);

/* Autenticación */
const auth =
getAuth(app);

/* =========================================
VALIDAR ADMINISTRADOR
========================================= */
onAuthStateChanged(auth,(user)=>{

/* Si no hay usuario */
if(!user){

window.location.href =
"login.html";

return;

}

/* Si no es correo administrador */
if(
user.email !==
"heidy.avilesp@uniagustiniana.edu.co"
){

window.location.href =
"index.html";

return;

}

/* Mostrar página */
document.body.style.display =
"block";

/* Cargar información */
cargarServicios();
cargarCitas();

});

/* =========================================
CERRAR SESIÓN
========================================= */
window.cerrarSesion = ()=>{

signOut(auth).then(()=>{

window.location.href =
"login.html";

});

};

/* =========================================
AGREGAR SERVICIO
========================================= */
window.agregarServicio =
async()=>{

/* Capturar campos */
const nombre =
document.getElementById("nombre").value;

const precio =
document.getElementById("precio").value;

const duracion =
document.getElementById("duracion").value;

const categoria =
document.getElementById("categoria").value;

/* Validar */
if(
!nombre ||
!precio ||
!duracion ||
!categoria
){

alert(
"Completa todos los campos"
);

return;

}

/* Guardar servicio */
await addDoc(
collection(db,"servicios"),
{
nombre,
precio:Number(precio),
duracion,
categoria
}
);

/* Recargar página */
location.reload();

};

/* =========================================
CARGAR SERVICIOS
========================================= */
async function cargarServicios(){

/* Contenedor HTML */
const contenedor =
document.getElementById(
"listaServicios"
);

/* Consultar Firebase */
const snap =
await getDocs(
collection(db,"servicios")
);

/* Variable HTML */
let html = "";

/* Recorrer servicios */
snap.forEach(docSnap=>{

const servicio =
docSnap.data();

const id =
docSnap.id;

/* Crear tarjeta */
html += `
<div class="admin-card">

<h3>${servicio.nombre}</h3>

<p>💰 $${servicio.precio}</p>

<p>⏱ ${servicio.duracion}</p>

<p>📌 ${servicio.categoria}</p>

<button onclick="editar('${id}')">
Editar ✏️
</button>

<button onclick="eliminar('${id}')">
Eliminar ❌
</button>

</div>
`;

});

/* Mostrar */
contenedor.innerHTML =
html;

}

/* =========================================
EDITAR SERVICIO
========================================= */
window.editar =
async(id)=>{

const nombre =
prompt("Nuevo nombre:");

const precio =
prompt("Nuevo precio:");

const duracion =
prompt("Nueva duración:");

if(
!nombre ||
!precio ||
!duracion
){
return;
}

await updateDoc(
doc(db,"servicios",id),
{
nombre,
precio:Number(precio),
duracion
}
);

location.reload();

};

/* =========================================
ELIMINAR SERVICIO
========================================= */
window.eliminar =
async(id)=>{

await deleteDoc(
doc(db,"servicios",id)
);

location.reload();

};

/* =========================================
CARGAR CITAS
========================================= */
async function cargarCitas(){

const contenedor =
document.getElementById(
"listaCitas"
);

/* Consultar citas */
const citasSnap =
await getDocs(
collection(db,"citas")
);

/* Consultar usuarios */
const usuariosSnap =
await getDocs(
collection(db,"usuarios")
);

let html = "";

/* Recorrer citas */
citasSnap.forEach(docSnap=>{

const cita =
docSnap.data();

const id =
docSnap.id;

/* Datos iniciales */
let nombreCliente =
"Cliente";

let telefonoCliente =
"";

/* Buscar usuario relacionado */
usuariosSnap.forEach(userDoc=>{

const usuario =
userDoc.data();

if(
usuario.email &&
cita.usuario &&
usuario.email.trim().toLowerCase() ===
cita.usuario.trim().toLowerCase()
){

nombreCliente =
usuario.nombre || "Cliente";

telefonoCliente =
usuario.telefono || "";

}

});

/* Color estado */
let color =
"#f1c40f";

if(cita.estado==="aprobado"){
color="#00b894";
}

if(cita.estado==="rechazado"){
color="#ff1744";
}

/* ======================================
GOOGLE CALENDAR
====================================== */
const fechaBase =
cita.fecha.replaceAll("-","");

const horaInicio =
cita.hora.replace(":","") + "00";

let hFin =
Math.floor((cita.finMin||0)/60);

let mFin =
(cita.finMin||0)%60;

if(hFin<10) hFin="0"+hFin;
if(mFin<10) mFin="0"+mFin;

const horaFin =
hFin + "" + mFin + "00";

/* Link calendar */
const linkCalendar =
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cita%20Belleza&dates=${fechaBase}T${horaInicio}/${fechaBase}T${horaFin}&details=${encodeURIComponent(cita.servicio)}&location=${encodeURIComponent(cita.direccion)}`;

/* Crear tarjeta */
html += `
<div class="admin-card">

<h3>${cita.servicio}</h3>

<p>👤 ${nombreCliente}</p>

<p>📧 ${cita.usuario}</p>

<p>📱 ${telefonoCliente}</p>

<p>📅 ${cita.fecha}</p>

<p>⏰ ${cita.hora}</p>

<p>📍 ${cita.direccion}</p>

<p style="
background:${color};
color:white;
padding:8px;
border-radius:12px;
font-weight:bold;
">
${cita.estado || "pendiente"}
</p>

<button
onclick="aprobar(
'${id}',
'${telefonoCliente}',
'${nombreCliente}',
'${cita.servicio}',
'${cita.fecha}',
'${cita.hora}'
)">
Aprobar ✅
</button>

<button
onclick="rechazar(
'${id}',
'${telefonoCliente}',
'${nombreCliente}',
'${cita.servicio}',
'${cita.fecha}',
'${cita.hora}'
)">
Rechazar ❌
</button>

${
cita.estado==="aprobado"
?
`
<button
onclick="window.open('${linkCalendar}','_blank')">
📅 Google Calendar
</button>
`
:
""
}

</div>
`;

});

/* Mostrar */
contenedor.innerHTML =
html;

}

/* =========================================
APROBAR CITA
========================================= */
window.aprobar =
async(
id,
telefono,
nombre,
servicio,
fecha,
hora
)=>{

await updateDoc(
doc(db,"citas",id),
{
estado:"aprobado"
}
);

/* Mensaje */
const mensaje =
encodeURIComponent(
`Hola ${nombre} ❤

Tu cita fue confirmada exitosamente ✨

💅 Servicio: ${servicio}
📅 Fecha: ${fecha}
🕒 Hora: ${hora}

Te esperamos ❤

Belleza`
);

/* Abrir WhatsApp */
window.open(
"https://wa.me/57"+
telefono+
"?text="+mensaje,
"_blank"
);

/* Recargar listado */
cargarCitas();

};

/* =========================================
RECHAZAR CITA
========================================= */
window.rechazar =
async(
id,
telefono,
nombre,
servicio,
fecha,
hora
)=>{

await updateDoc(
doc(db,"citas",id),
{
estado:"rechazado"
}
);

/* Mensaje */
const mensaje =
encodeURIComponent(
`Hola ${nombre} ❤

Tu cita no pudo ser confirmada en ese horario ❌

💅 Servicio: ${servicio}
📅 Fecha: ${fecha}
🕒 Hora: ${hora}

Reserva otro horario disponible ❤

Belleza`
);

/* Abrir WhatsApp */
window.open(
"https://wa.me/57"+
telefono+
"?text="+mensaje,
"_blank"
);

/* Recargar listado */
cargarCitas();

};
