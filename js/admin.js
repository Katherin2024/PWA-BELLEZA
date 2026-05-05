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
updateDoc,
getDoc
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


/* =========================================
PROMOCIONES (COMPLETO PRO)
========================================= */

/* CARGAR SERVICIOS EN SELECT */
async function cargarServiciosPromo(){

const select = document.getElementById("serviciosPromo");
if(!select) return;

select.innerHTML = "";

const snap = await getDocs(collection(db,"servicios"));

snap.forEach(docSnap=>{

const s = docSnap.data();

select.innerHTML += `
<option value="${s.nombre}" data-precio="${s.precio}">
${s.nombre} - $${Number(s.precio).toLocaleString()}
</option>
`;

});

}

/* PERMITIR MULTI CLICK SIN CTRL */
function activarMultiSelect(){

const select = document.getElementById("serviciosPromo");
if(!select) return;

/* 🔥 DETECTAR MOVIL REAL */
const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* 💻 PC */
if(!esMovil){

select.addEventListener("mousedown", function(e){

e.preventDefault();

const option = e.target;

if(option.tagName === "OPTION"){
option.selected = !option.selected;
}

actualizarResumen();

return false;

});

}

/* 📱 MOVIL */
select.addEventListener("change", ()=>{
actualizarResumen();
});

}


/* CALCULAR RESUMEN */
function actualizarResumen(){

const select = document.getElementById("serviciosPromo");
const seleccionados = [...select.selectedOptions];

let total = 0;

seleccionados.forEach(opt=>{
total += Number(opt.dataset.precio);
});

const descuento =
Number(document.getElementById("descuentoPromo").value || 0);

const final =
total - (total * descuento / 100);

/* MOSTRAR */
document.getElementById("totalServicios").innerText =
"Total servicios: $" + total.toLocaleString();

document.getElementById("descuentoTexto").innerText =
"Descuento: " + descuento + "%";

document.getElementById("precioFinal").innerText =
"Total final: $" + final.toLocaleString();

}

/* GUARDAR PROMO */
window.crearPromo = async()=>{

const titulo =
document.getElementById("tituloPromo").value.trim();

const descuento =
Number(document.getElementById("descuentoPromo").value);

const fechaInicio =
document.getElementById("fechaInicio").value;

const fechaFin =
document.getElementById("fechaFin").value;

const activa =
document.getElementById("activaPromo").checked;

const select =
document.getElementById("serviciosPromo");

const seleccionados = [...select.selectedOptions];

const servicios = seleccionados.map(opt => opt.value);

if(!titulo || servicios.length === 0){
alert("Completa todo ⚠️");
return;
}

/* CALCULAR */
let total = 0;

seleccionados.forEach(opt=>{
total += Number(opt.dataset.precio);
});

const precioFinal =
total - (total * descuento / 100);

/* GUARDAR */
await addDoc(collection(db,"promociones"),{

titulo,
servicios,
precioOriginal: total,
precioFinal,
descuento,
activa,
fechaInicio,
fechaFin

});

alert("Promo guardada 💖");

location.reload();

};

/* LISTAR PROMOS */
async function cargarPromos(){

const contenedor =
document.getElementById("listaPromos");

if(!contenedor) return;

contenedor.innerHTML = "";

const snap =
await getDocs(collection(db,"promociones"));

snap.forEach(docSnap=>{

const p = docSnap.data();
const id = docSnap.id;

contenedor.innerHTML += `
<div class="admin-card">

<h3>${p.titulo}</h3>

<p>${p.servicios.join(" + ")}</p>

<p><strong>$${Number(p.precioFinal).toLocaleString()}</strong></p>

<p style="color:${p.activa ? 'green' : 'red'};">
${p.activa ? 'Activa' : 'Inactiva'}
</p>

<p>${p.descuento}% OFF</p>

<div style="margin-top:10px;">

<button onclick="togglePromo('${id}', ${p.activa})">
${p.activa ? 'Desactivar' : 'Activar'}
</button>

<button onclick="editarPromo('${id}')">
Editar
</button>

<button onclick="eliminarPromo('${id}')">
Eliminar
</button>

</div>

</div>
`;

});

}

/* ACTIVAR / DESACTIVAR */
window.togglePromo = async(id, estadoActual)=>{

await updateDoc(doc(db,"promociones",id),{
activa: !estadoActual
});

cargarPromos();

};

/* EDITAR PROMO */
window.editarPromo = async(id)=>{

const snap = await getDoc(doc(db,"promociones",id));

if(!snap.exists()) return;

const p = snap.data();

const nuevoTitulo = prompt("Nuevo nombre:", p.titulo);
const nuevoDescuento = prompt("Nuevo descuento:", p.descuento);

if(!nuevoTitulo || nuevoDescuento === null) return;

const total = p.precioOriginal;
const descuento = Number(nuevoDescuento);
const precioFinal = total - (total * descuento / 100);

await updateDoc(doc(db,"promociones",id),{

titulo: nuevoTitulo,
descuento,
precioFinal

});

cargarPromos();

};

/* ELIMINAR */
window.eliminarPromo = async(id)=>{

await deleteDoc(doc(db,"promociones",id));

location.reload();

};



document.addEventListener("DOMContentLoaded", ()=>{

// 🔥 ACTIVAR FECHAS (iPhone FIX)
activarFecha("fechaInicio", "fechaInicioReal");
activarFecha("fechaFin", "fechaFinReal");
activarFecha("fechaInicioReporte", "fechaInicioReporteReal");
activarFecha("fechaFinReporte", "fechaFinReporteReal");

   

/* PROMOCIONES */
cargarServiciosPromo();
cargarPromos();
activarMultiSelect();

const descuento = document.getElementById("descuentoPromo");
if(descuento){
descuento.addEventListener("change", actualizarResumen);
}

/* BOTONES REPORTES */
const btnReporte = document.getElementById("btnReporte");
if(btnReporte){
btnReporte.addEventListener("click", generarReporteRango);
}

const btnExcel = document.getElementById("btnExcel");
if(btnExcel){
btnExcel.addEventListener("click", exportarExcel);
}

});



/* =========================================
REPORTES AVANZADOS 📊
========================================= */

let datosReporte = [];

/* ===============================
OBTENER CITAS
=============================== */
async function obtenerCitas(){

const snap = await getDocs(collection(db,"citas"));

let citas = [];

snap.forEach(docSnap=>{
citas.push(docSnap.data());
});

return citas;

}

/* ===============================
FILTRAR POR RANGO
=============================== */
let bloqueado = false;

window.generarReporteRango = async () => {

if(bloqueado) return;
bloqueado = true;

try{

const inicio = document.getElementById("fechaInicioReporte").value;
const fin = document.getElementById("fechaFinReporte").value;

if(!inicio || !fin){
alert("Selecciona ambas fechas ⚠️");
return;
}

const citas = await obtenerCitas();

const filtradas = citas.filter(c => 
c.fecha >= inicio && c.fecha <= fin
);

procesarReporteAvanzado(filtradas);

} catch(error){

console.error("Error reporte:", error);

} finally {

bloqueado = false;

}

};

/* ===============================
PROCESAR REPORTE AVANZADO
=============================== */
function procesarReporteAvanzado(citas){

let total = 0;
let atendidas = 0;
let canceladas = 0;

/* 🔥 NUEVO */
let serviciosConteo = {};
let ingresosPorDia = {};
let clientesFrecuentes = {};

/* RECORRER */
citas.forEach(c => {

total += Number(c.valorTotal || 0);

if(c.estado === "aprobado") atendidas++;
if(c.estado === "rechazado") canceladas++;

/* ======================
SERVICIOS MÁS PEDIDOS
====================== */
const listaServicios = c.servicio.split(" + ");

listaServicios.forEach(s => {

serviciosConteo[s] = (serviciosConteo[s] || 0) + 1;

});

/* ======================
INGRESOS POR DÍA
====================== */
ingresosPorDia[c.fecha] =
(ingresosPorDia[c.fecha] || 0) + Number(c.valorTotal || 0);

/* ======================
CLIENTES FRECUENTES
====================== */
clientesFrecuentes[c.usuario] =
(clientesFrecuentes[c.usuario] || 0) + 1;

});

/* ======================
TOP 5 SERVICIOS 🔥
====================== */
const topServicios = Object.entries(serviciosConteo)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);

/* ======================
MEJOR DÍA 💰
====================== */
const mejorDia = Object.entries(ingresosPorDia)
.sort((a,b)=>b[1]-a[1])[0];

/* ======================
TOP CLIENTES 👩‍💼
====================== */
const topClientes = Object.entries(clientesFrecuentes)
.sort((a,b)=>b[1]-a[1])
.slice(0,3);

/* ======================
PROMEDIO
====================== */
const promedio =
citas.length > 0 ? total / citas.length : 0;

/* ======================
DATA EXCEL
====================== */
datosReporte = citas.map(c => ({
Fecha: c.fecha,
Cliente: c.usuario,
Servicio: c.servicio,
Estado: c.estado,
Total: c.valorTotal
}));

/* ======================
MOSTRAR RESULTADOS
====================== */
let mensaje = `
📊 REPORTE AVANZADO

💰 Total: $${total.toLocaleString()}
📅 Citas: ${citas.length}
✅ Atendidas: ${atendidas}
❌ Canceladas: ${canceladas}
📈 Promedio por cita: $${Math.round(promedio).toLocaleString()}

🔥 TOP SERVICIOS:
`;

topServicios.forEach(s=>{
mensaje += `\n• ${s[0]} (${s[1]})`;
});

if(mejorDia){
mensaje += `\n\n💸 Mejor día: ${mejorDia[0]} ($${mejorDia[1].toLocaleString()})`;
}

mensaje += `\n\n👑 TOP CLIENTES:\n`;

topClientes.forEach(c=>{
mensaje += `• ${c[0]} (${c[1]} citas)\n`;
});

alert(mensaje);
/* 🔥 GENERAR GRAFICAS */
generarGraficas(citas);

}

/* ===============================
EXPORTAR EXCEL 📥
=============================== */
async function exportarExcel(){

const inicio = document.getElementById("fechaInicioReporte").value;
const fin = document.getElementById("fechaFinReporte").value;

if(!inicio || !fin){
alert("Selecciona fechas ⚠️");
return;
}

/* 🔥 OBTENER DATOS DIRECTO */
const snap = await getDocs(collection(db,"citas"));

let citas = [];

snap.forEach(doc=>{
const c = doc.data();

if(c.fecha >= inicio && c.fecha <= fin){
citas.push(c);
}

});

if(citas.length === 0){
alert("No hay datos en ese rango ⚠️");
return;
}

/* 🔥 FORMATO EXCEL */
const data = citas.map(c => ({
Fecha: c.fecha,
Cliente: c.usuario,
Servicio: c.servicio,
Estado: c.estado,
Total: c.valorTotal
}));

/* 🔥 CREAR ARCHIVO */
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Reporte");

XLSX.writeFile(wb, "reporte_belleza.xlsx");

}

/* =========================================
GRAFICAS 📊
========================================= */

let chartServicios = null;
let chartIngresos = null;

function generarGraficas(citas){

/* ======================
SERVICIOS
====================== */
let serviciosConteo = {};

citas.forEach(c => {

const lista = c.servicio.split(" + ");

lista.forEach(s=>{
serviciosConteo[s] = (serviciosConteo[s] || 0) + 1;
});

});

/* TOP */
const labelsServicios = Object.keys(serviciosConteo);
const dataServicios = Object.values(serviciosConteo);

/* destruir si existe */
if(chartServicios){
chartServicios.destroy();
}

const ctx1 =
document.getElementById("graficaServicios");

chartServicios = new Chart(ctx1, {
type: "bar",
data: {
labels: labelsServicios,
datasets: [{
label: "Servicios más solicitados",
data: dataServicios
}]
}
});

/* ======================
INGRESOS POR DIA
====================== */
let ingresos = {};

citas.forEach(c=>{
ingresos[c.fecha] =
(ingresos[c.fecha] || 0) + Number(c.valorTotal || 0);
});

const labelsIngresos = Object.keys(ingresos);
const dataIngresos = Object.values(ingresos);

if(chartIngresos){
chartIngresos.destroy();
}

const ctx2 =
document.getElementById("graficaIngresos");

chartIngresos = new Chart(ctx2, {
type: "line",
data: {
labels: labelsIngresos,
datasets: [{
label: "Ingresos por día",
data: dataIngresos
}]
}
});

}
function activarFecha(fakeId, realId){

const fake = document.getElementById(fakeId);
const real = document.getElementById(realId);

fake.addEventListener("click", () => {
real.showPicker(); // 🔥 abre calendario iPhone
});

real.addEventListener("change", () => {
fake.value = real.value;
});

}