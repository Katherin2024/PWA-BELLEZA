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

import { app }
from "./firebase-config.js";

/* =========================================
INICIALIZAR
========================================= */
const db = getFirestore(app);
const auth = getAuth(app);

/* =========================================
VALIDAR ADMIN
========================================= */
onAuthStateChanged(auth,(user)=>{

if(!user){
window.location.href = "login.html";
return;
}

if(
user.email !==
"heidy.avilesp@uniagustiniana.edu.co"
){
window.location.href = "index.html";
return;
}

document.body.style.display = "block";

cargarServicios();
cargarCitas();

});

/* =========================================
CERRAR SESIÓN
========================================= */
window.cerrarSesion = ()=>{

signOut(auth).then(()=>{

window.location.href = "login.html";

});

};

/* =========================================
WHATSAPP MOVIL + PC
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
AGREGAR SERVICIO
========================================= */
window.agregarServicio = async()=>{

const nombre =
document.getElementById("nombre").value.trim();

const precio =
document.getElementById("precio").value.trim();

const duracion =
document.getElementById("duracion").value.trim();

const categoria =
document.getElementById("categoria").value;

if(
!nombre ||
!precio ||
!duracion ||
!categoria
){
alert("Completa todos los campos");
return;
}

await addDoc(
collection(db,"servicios"),
{
nombre,
precio:Number(precio),
duracion,
categoria
}
);

location.reload();

};

/* =========================================
CARGAR SERVICIOS
========================================= */
async function cargarServicios(){

const contenedor =
document.getElementById("listaServicios");

const snap =
await getDocs(collection(db,"servicios"));

let html = "";

snap.forEach(docSnap=>{

const s = docSnap.data();
const id = docSnap.id;

html += `
<div class="admin-card">

<h3>${s.nombre}</h3>

<p>💰 $${s.precio}</p>

<p>⏱ ${s.duracion}</p>

<p>📌 ${s.categoria}</p>

<button onclick="editar('${id}')">
Editar ✏️
</button>

<button onclick="eliminar('${id}')">
Eliminar ❌
</button>

</div>
`;

});

contenedor.innerHTML = html;

}

/* =========================================
EDITAR SERVICIO
========================================= */
window.editar = async(id)=>{

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
)return;

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
window.eliminar = async(id)=>{

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
document.getElementById("listaCitas");

const citasSnap =
await getDocs(collection(db,"citas"));

const usuariosSnap =
await getDocs(collection(db,"usuarios"));

let html = "";

citasSnap.forEach(docSnap=>{

const c = docSnap.data();
const id = docSnap.id;

let nombreCliente = "Cliente";
let telefonoCliente = "";

usuariosSnap.forEach(userDoc=>{

const u = userDoc.data();

if(
u.email &&
c.usuario &&
u.email.trim().toLowerCase() ===
c.usuario.trim().toLowerCase()
){

nombreCliente =
u.nombre || "Cliente";

telefonoCliente =
u.telefono || "";

}

});

let color = "#f1c40f";

if(c.estado === "aprobado"){
color = "#00b894";
}

if(c.estado === "rechazado"){
color = "#ff1744";
}

/* GOOGLE CALENDAR */
const fechaBase =
c.fecha.replaceAll("-","");

const horaInicio =
c.hora.replace(":","") + "00";

let hFin =
Math.floor((c.finMin || 0)/60);

let mFin =
(c.finMin || 0)%60;

if(hFin < 10) hFin = "0"+hFin;
if(mFin < 10) mFin = "0"+mFin;

const horaFin =
hFin + "" + mFin + "00";

const linkCalendar =
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cita%20Belleza&dates=${fechaBase}T${horaInicio}/${fechaBase}T${horaFin}&details=${encodeURIComponent(c.servicio)}&location=${encodeURIComponent(c.direccion)}`;

html += `
<div class="admin-card">

<h3>${c.servicio}</h3>

<p>👤 ${nombreCliente}</p>

<p>📧 ${c.usuario}</p>

<p>📱 ${telefonoCliente}</p>

<p>📅 ${c.fecha}</p>

<p>⏰ ${c.hora}</p>

<p>📍 ${c.direccion}</p>

<p style="
background:${color};
color:white;
padding:8px;
border-radius:12px;
font-weight:bold;
">
${c.estado || "pendiente"}
</p>

<button onclick="aprobar(
'${id}',
'${telefonoCliente}',
'${nombreCliente}',
'${c.servicio}',
'${c.fecha}',
'${c.hora}'
)">
Aprobar ✅
</button>

<button onclick="rechazar(
'${id}',
'${telefonoCliente}',
'${nombreCliente}',
'${c.servicio}',
'${c.fecha}',
'${c.hora}'
)">
Rechazar ❌
</button>

${
c.estado === "aprobado"
?
`
<button onclick="window.open('${linkCalendar}','_blank')">
📅 Google Calendar
</button>
`
:
""
}

</div>
`;

});

contenedor.innerHTML = html;

}

/* =========================================
APROBAR CITA
========================================= */
window.aprobar = async(
id,
telefono,
nombre,
servicio,
fecha,
hora
)=>{

telefono =
telefono.replace(/\D/g,"");

await updateDoc(
doc(db,"citas",id),
{
estado:"aprobado"
}
);

const mensaje =
encodeURIComponent(
`Hola ${nombre} 💖

Tu cita fue confirmada exitosamente ✨

💅 Servicio: ${servicio}
📅 Fecha: ${fecha}
🕒 Hora: ${hora}

Te esperamos 💖

Belleza`
);

abrirWhatsApp(
"https://wa.me/57"+
telefono+
"?text="+mensaje
);

cargarCitas();

};

/* =========================================
RECHAZAR CITA
========================================= */
window.rechazar = async(
id,
telefono,
nombre,
servicio,
fecha,
hora
)=>{

telefono =
telefono.replace(/\D/g,"");

await updateDoc(
doc(db,"citas",id),
{
estado:"rechazado"
}
);

const mensaje =
encodeURIComponent(
`Hola ${nombre} 💖

Tu cita no pudo ser confirmada en ese horario ❌

💅 Servicio: ${servicio}
📅 Fecha: ${fecha}
🕒 Hora: ${hora}

Te invitamos a reservar otro horario disponible 💖

Belleza`
);

abrirWhatsApp(
"https://wa.me/57"+
telefono+
"?text="+mensaje
);

cargarCitas();

};