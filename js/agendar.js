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

import { app } from "./firebase-config.js";

/* =========================================
INICIALIZAR
========================================= */
const db = getFirestore(app);
const auth = getAuth(app);

/* =========================================
VARIABLES
========================================= */
const horasBase = [
"08:00","09:00","10:00","11:00",
"12:00","13:00","14:00","15:00","16:00"
];

const trayectoMin = 35;

let serviciosElegidos = [];
let serviciosFirebase = [];
let duracionTotal = 0;

/* 💖 NUEVO */
let esPromo = false;

/* Valores pago */
let totalGeneral = 0;
let anticipoGeneral = 0;
let saldoGeneral = 0;

/* =========================================
OBTENER MINUTOS
========================================= */
function obtenerMinutos(texto){

texto = String(texto).toLowerCase();

if(texto.includes("120")) return 120;
if(texto.includes("90")) return 90;
if(texto.includes("60")) return 60;
if(texto.includes("40")) return 40;
if(texto.includes("30")) return 30;

return 60;

}

/* =========================================
FORMATO HORA
========================================= */
function formatoHora(hora){

let [h,m] = hora.split(":");

h = Number(h);

let ampm = h >= 12 ? "PM" : "AM";

let hora12 = h % 12;

if(hora12 === 0) hora12 = 12;

return hora12 + ":" + m + " " + ampm;

}

/* =========================================
ACTUALIZAR VISTA
========================================= */
function actualizarVista(){

document.getElementById("servicio").value =
serviciosElegidos.map(s=>s.nombre).join(" + ");

document.getElementById("duracion").value =
duracionTotal + " min + trayecto";

actualizarPago();

}

/* =========================================
CALCULAR PAGO
========================================= */
function actualizarPago(){

if(esPromo) return; // 🔥 NO recalcular promo

let total = 0;

const precioPrincipal =
Number(localStorage.getItem("precio") || 0);

if(serviciosElegidos.length > 0){
total += precioPrincipal;
}

for(let i=1; i<serviciosElegidos.length; i++){

const nombre = serviciosElegidos[i].nombre;

const encontrado =
serviciosFirebase.find(s => s.nombre === nombre);

if(encontrado){
total += Number(encontrado.precio);
}

}

const anticipo = Math.round(total * 0.20);
const saldo = total - anticipo;

totalGeneral = total;
anticipoGeneral = anticipo;
saldoGeneral = saldo;

document.getElementById("valorTotal").innerText =
"Valor total: $" + total.toLocaleString();

document.getElementById("anticipo").innerText =
"Anticipo (20%): $" + anticipo.toLocaleString();

document.getElementById("saldo").innerText =
"Saldo restante: $" + saldo.toLocaleString();

}

/* =========================================
SERVICIO PRINCIPAL + PROMO
========================================= */
function cargarPrincipal(){

const promo = JSON.parse(localStorage.getItem("promoActiva"));

/* 🔥 PROMOCIÓN */
if(promo){

esPromo = true;

serviciosElegidos = [];
duracionTotal = 0;

promo.servicios.forEach(nombre=>{
serviciosElegidos.push({
nombre,
minutos:60
});
duracionTotal += 60;
});

/* 💰 precio fijo */
totalGeneral = promo.precioFinal;
anticipoGeneral = Math.round(totalGeneral * 0.20);
saldoGeneral = totalGeneral - anticipoGeneral;

/* 🚫 BLOQUEAR EXTRAS */
const extra = document.getElementById("otroServicio");
if(extra) extra.style.display = "none";

const btnExtra =
document.querySelector("button[onclick='agregarServicioExtra()']");
if(btnExtra) btnExtra.style.display = "none";

/* UI */
document.getElementById("servicio").value = promo.titulo;

document.getElementById("duracion").value =
duracionTotal + " min + trayecto";

document.getElementById("valorTotal").innerText =
"Valor total: $" + totalGeneral.toLocaleString();

document.getElementById("anticipo").innerText =
"Anticipo (20%): $" + anticipoGeneral.toLocaleString();

document.getElementById("saldo").innerText =
"Saldo restante: $" + saldoGeneral.toLocaleString();

/* limpiar */
localStorage.removeItem("promoActiva");

return;
}

/* ===== NORMAL ===== */
const nombre =
localStorage.getItem("servicio") || "";

const duracion =
localStorage.getItem("duracion") || "60";

const minutos =
obtenerMinutos(duracion);

if(nombre){

serviciosElegidos.push({
nombre,
minutos
});

duracionTotal += minutos;

actualizarVista();

}

}

/* =========================================
SERVICIOS EXTRA
========================================= */
async function cargarServicios(){

if(esPromo) return; // 🔥 NO cargar extras en promo

const select = document.getElementById("otroServicio");

const snap = await getDocs(collection(db,"servicios"));

snap.forEach(docSnap=>{

const s = docSnap.data();

serviciosFirebase.push(s);

if(select){
select.innerHTML += `
<option value="${s.nombre}">
${s.nombre}
</option>
`;
}

});

actualizarPago();

}

/* =========================================
AGREGAR EXTRA
========================================= */
window.agregarServicioExtra = ()=>{

if(esPromo){
alert("Esta promoción no permite agregar más servicios 💖");
return;
}

const nombre = document.getElementById("otroServicio").value;

if(!nombre){
alert("Selecciona un servicio ⚠️");
return;
}

if(serviciosElegidos.length >= 3){
alert("Máximo 3 servicios 💖");
return;
}

const repetido =
serviciosElegidos.some(s => s.nombre === nombre);

if(repetido){
alert("Ese servicio ya fue agregado ⚠️");
return;
}

const encontrado =
serviciosFirebase.find(s => s.nombre === nombre);

if(!encontrado) return;

const minutos = obtenerMinutos(encontrado.duracion);

serviciosElegidos.push({nombre,minutos});
duracionTotal += minutos;

actualizarVista();

const fecha = document.getElementById("fecha").value;
if(fecha) cargarHorasDisponibles();

};

/* =========================================
HORARIOS DISPONIBLES
========================================= */
async function cargarHorasDisponibles(){

const fecha = document.getElementById("fecha").value;
const select = document.getElementById("hora");

select.innerHTML =
`<option value="">⏰ Selecciona hora</option>`;

if(!fecha) return;

const totalMin = duracionTotal + trayectoMin;

const snap = await getDocs(collection(db,"citas"));

const hoy = new Date();
const hoyTexto = hoy.toISOString().split("T")[0];
const horaActualMin = hoy.getHours()*60 + hoy.getMinutes();

horasBase.forEach(horaTexto=>{

const [h,m] = horaTexto.split(":");

const inicioMin = Number(h)*60 + Number(m);
const finMin = inicioMin + totalMin;

if(finMin > 1080) return;

if(fecha === hoyTexto){
if(inicioMin <= horaActualMin + 30) return;
}

let ocupado = false;

snap.forEach(docSnap=>{
const c = docSnap.data();

if(c.fecha === fecha){
if(inicioMin < c.finMin && finMin > c.inicioMin){
ocupado = true;
}
}
});

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
USUARIO + DIRECCIONES
========================================= */
onAuthStateChanged(auth, async(user)=>{

if(!user){
alert("Debes iniciar sesión ⚠️");
window.location.href = "login.html";
return;
}

const snap = await getDoc(doc(db,"usuarios",user.uid));

if(snap.exists()){

const data = snap.data();
const select = document.getElementById("direccion");

if(data.direccion1){
select.innerHTML += `<option value="${data.direccion1}">${data.direccion1}</option>`;
}

if(data.direccion2){
select.innerHTML += `<option value="${data.direccion2}">${data.direccion2}</option>`;
}

}

});

/* =========================================
GUARDAR CITA
========================================= */
window.guardarCita = async()=>{

const fecha = document.getElementById("fecha").value;
const hora = document.getElementById("hora").value;
const direccion = document.getElementById("direccion").value;

if(!fecha || !hora || !direccion){
alert("Completa todos los campos ⚠️");
return;
}

const fechaObj = new Date(fecha + "T12:00:00");
const dia = fechaObj.getDay();

if(dia === 1 || dia === 2){
alert("No laboramos lunes ni martes 💖");
return;
}

const [h,m] = hora.split(":");

const inicioMin = Number(h)*60 + Number(m);
const finMin = inicioMin + duracionTotal + trayectoMin;

await addDoc(collection(db,"citas"),{

usuario: auth.currentUser.email,

servicio: serviciosElegidos.map(s=>s.nombre).join(" + "),

fecha,
hora,
direccion,

duracionMin: duracionTotal,
trayectoMin,

inicioMin,
finMin,

valorTotal: totalGeneral,
anticipo: anticipoGeneral,
saldo: saldoGeneral,

estadoPago:"pendiente",
estado:"pendiente"

});

alert(`Anticipo: $${anticipoGeneral.toLocaleString()}`);

window.location.href = "mis-citas.html";

};

/* =========================================
BLOQUEO DÍAS + HORAS
========================================= */
const inputFecha = document.getElementById("fecha");

if(inputFecha){

const hoy = new Date();

const yyyy = hoy.getFullYear();
const mm = String(hoy.getMonth()+1).padStart(2,"0");
const dd = String(hoy.getDate()).padStart(2,"0");

inputFecha.min = `${yyyy}-${mm}-${dd}`;

inputFecha.addEventListener("change", ()=>{

const fechaSel = new Date(inputFecha.value + "T12:00:00");
const dia = fechaSel.getDay();

if(dia === 1 || dia === 2){

alert("No laboramos lunes ni martes 💖");

inputFecha.value = "";

document.getElementById("hora").innerHTML =
`<option value="">⏰ Selecciona hora</option>`;

return;
}

cargarHorasDisponibles();

});

}

/* =========================================
INICIAR
========================================= */
cargarPrincipal();
cargarServicios();

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