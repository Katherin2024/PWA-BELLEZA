/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getFirestore,
collection,
getDocs,
addDoc,
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

/* Base de datos */
const db =
getFirestore(app);

/* Autenticación */
const auth =
getAuth(app);

/* =========================================
VARIABLES GENERALES
========================================= */

/* Horarios disponibles */
const horasBase = [
"08:00","09:00","10:00","11:00",
"12:00","13:00","14:00","15:00","16:00"
];

/* Tiempo promedio desplazamiento */
const trayectoMin = 35;

/* Servicios elegidos por usuario */
let serviciosElegidos = [];

/* Servicios cargados desde Firebase */
let serviciosFirebase = [];

/* Tiempo total */
let duracionTotal = 0;

/* =========================================
CONVERTIR TEXTO A MINUTOS
========================================= */
function obtenerMinutos(texto){

texto =
texto.toLowerCase();

if(texto.includes("120")) return 120;
if(texto.includes("90")) return 90;
if(texto.includes("60")) return 60;
if(texto.includes("40")) return 40;
if(texto.includes("30")) return 30;
if(texto.includes("2")) return 120;
if(texto.includes("1")) return 60;

return 60;

}

/* =========================================
FORMATO VISUAL HORA
========================================= */
function formatoHora(hora){

let [h,m] =
hora.split(":");

h = Number(h);

let ampm =
h >= 12 ? "PM" : "AM";

let hora12 =
h % 12;

if(hora12 === 0){
hora12 = 12;
}

return hora12 + ":" + m + " " + ampm;

}

/* =========================================
ACTUALIZAR CAMPOS VISUALES
========================================= */
function actualizarVista(){

/* Mostrar servicios */
document.getElementById("servicio").value =
serviciosElegidos
.map(s => s.nombre)
.join(" + ");

/* Mostrar duración */
document.getElementById("duracion").value =
duracionTotal + " min + trayecto";

}

/* =========================================
CARGAR SERVICIO INICIAL
========================================= */
function cargarPrincipal(){

/* Leer localStorage */
const nombre =
localStorage.getItem("servicio") || "";

const duracion =
localStorage.getItem("duracion") || "60";

/* Convertir duración */
const minutos =
obtenerMinutos(duracion);

/* Guardar servicio inicial */
serviciosElegidos.push({
nombre:nombre,
minutos:minutos
});

/* Sumar duración */
duracionTotal += minutos;

/* Refrescar vista */
actualizarVista();

}

/* =========================================
CARGAR SERVICIOS EXTRA
========================================= */
async function cargarServicios(){

const select =
document.getElementById("otroServicio");

/* Consultar colección */
const snap =
await getDocs(
collection(db,"servicios")
);

/* Recorrer servicios */
snap.forEach(docSnap=>{

const servicio =
docSnap.data();

/* Guardar array */
serviciosFirebase.push(servicio);

/* Agregar option */
select.innerHTML += `
<option value="${servicio.nombre}">
${servicio.nombre}
</option>
`;

});

}

/* =========================================
AGREGAR SERVICIO EXTRA
========================================= */
window.agregarServicioExtra = ()=>{

const nombre =
document.getElementById("otroServicio").value;

/* Validar selección */
if(!nombre){

alert(
"Selecciona un servicio ⚠️"
);

return;

}

/* Máximo 3 */
if(serviciosElegidos.length >= 3){

alert(
"Máximo 3 servicios 💖"
);

return;

}

/* Evitar repetidos */
const repetido =
serviciosElegidos.some(
s => s.nombre === nombre
);

if(repetido){

alert(
"Ese servicio ya fue agregado ⚠️"
);

return;

}

/* Buscar servicio */
const encontrado =
serviciosFirebase.find(
s => s.nombre === nombre
);

/* Obtener duración */
const minutos =
obtenerMinutos(
encontrado.duracion
);

/* Agregar */
serviciosElegidos.push({
nombre:nombre,
minutos:minutos
});

/* Sumar tiempo */
duracionTotal += minutos;

/* Actualizar */
actualizarVista();

/* Si ya eligió fecha */
const fecha =
document.getElementById("fecha").value;

if(fecha){
cargarHorasDisponibles();
}

};

/* =========================================
HORARIOS DISPONIBLES
========================================= */
async function cargarHorasDisponibles(){

const fecha =
document.getElementById("fecha").value;

const select =
document.getElementById("hora");

/* Reset select */
select.innerHTML =
`<option value="">⏰ Selecciona hora</option>`;

/* Sin fecha */
if(!fecha) return;

/* Tiempo total */
const totalMin =
duracionTotal +
trayectoMin;

/* Consultar citas */
const snap =
await getDocs(
collection(db,"citas")
);

/* Revisar horas */
horasBase.forEach(horaTexto=>{

const [h,m] =
horaTexto.split(":");

/* Inicio */
const inicioMin =
Number(h)*60 +
Number(m);

/* Final */
const finMin =
inicioMin +
totalMin;

/* Máximo 6 PM */
if(finMin > 1080){
return;
}

let ocupado =
false;

/* Comparar citas */
snap.forEach(docSnap=>{

const cita =
docSnap.data();

if(cita.fecha === fecha){

if(
inicioMin < cita.finMin &&
finMin > cita.inicioMin
){
ocupado = true;
}

}

});

/* Si libre */
if(!ocupado){

select.innerHTML += `
<option value="${horaTexto}">
${formatoHora(horaTexto)}
</option>
`;

}

});

}

/* =========================================
CARGAR DIRECCIONES USUARIO
========================================= */
onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

/* Buscar usuario */
const snap =
await getDoc(
doc(db,"usuarios",user.uid)
);

/* Si existe */
if(snap.exists()){

const data =
snap.data();

const select =
document.getElementById("direccion");

/* Dirección 1 */
if(data.direccion1){

select.innerHTML += `
<option value="${data.direccion1}">
${data.direccion1}
</option>
`;

}

/* Dirección 2 */
if(data.direccion2){

select.innerHTML += `
<option value="${data.direccion2}">
${data.direccion2}
</option>
`;

}

}

});

/* =========================================
GUARDAR CITA
========================================= */
window.guardarCita =
async()=>{

const fecha =
document.getElementById("fecha").value;

const hora =
document.getElementById("hora").value;

const direccion =
document.getElementById("direccion").value;

/* Validar */
if(
!fecha ||
!hora ||
!direccion
){

alert(
"Completa todos los campos ⚠️"
);

return;

}

/* Convertir hora */
const [h,m] =
hora.split(":");

const inicioMin =
Number(h)*60 +
Number(m);

const finMin =
inicioMin +
duracionTotal +
trayectoMin;

try{

/* Guardar Firebase */
await addDoc(
collection(db,"citas"),
{
usuario:
auth.currentUser.email,

servicio:
serviciosElegidos
.map(s=>s.nombre)
.join(" + "),

fecha:
fecha,

hora:
hora,

direccion:
direccion,

duracionMin:
duracionTotal,

trayectoMin:
trayectoMin,

inicioMin:
inicioMin,

finMin:
finMin,

estado:
"pendiente"
}
);

/* Mensaje admin */
const mensaje =
encodeURIComponent(
`Hola 💖 Nueva cita solicitada

👤 ${auth.currentUser.email}

💅 ${serviciosElegidos.map(s=>s.nombre).join(" + ")}

📅 ${fecha}
⏰ ${hora}
📍 ${direccion}

Revisar panel administrador ✨`
);

/* Link WhatsApp */
const linkWhats =
"https://wa.me/573227257705?text=" +
mensaje;

/* Mostrar pantalla final */
document.querySelector(".container").innerHTML = `

<h2>✅ Cita guardada 💖</h2>

<p>
Tu solicitud fue registrada con éxito.
</p>

<button onclick="window.open('${linkWhats}','_blank')">
📲 Enviar WhatsApp
</button>

`;

}catch(error){

alert(
"Error: " +
error.message
);

}

};

/* =========================================
EVENTO CAMBIO FECHA
========================================= */
document
.getElementById("fecha")
.addEventListener(
"change",
cargarHorasDisponibles
);

/* =========================================
BOTÓN VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"index.html";

};

/* =========================================
INICIAR PÁGINA
========================================= */
cargarPrincipal();
cargarServicios();
