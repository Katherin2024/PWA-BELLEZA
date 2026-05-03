/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getAuth,
onAuthStateChanged,
signOut
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
getDocs,       
collection      
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import { app }
from "./firebase-config.js";

/* =========================================
INICIALIZAR
========================================= */
const auth =
getAuth(app);

const db =
getFirestore(app);

/* =========================================
ESTADO LOGIN
========================================= */
onAuthStateChanged(auth, async(user)=>{

const saludo =
document.getElementById("saludo");

const btnLogin =
document.getElementById("btnLogin");

const btnLogout =
document.getElementById("btnLogout");

const btnAdmin =
document.getElementById("btnAdmin");

/* Usuario logueado */
if(user){

btnLogin.style.display = "none";
btnLogout.style.display = "inline-block";

/* Buscar usuario */
const snap =
await getDoc(
doc(db,"usuarios",user.uid)
);

/* Si existe */
if(snap.exists()){

const data =
snap.data();

/* Saludo */
saludo.innerText =
"Hola, " + data.nombre + " 💖";

/* Admin */
if(data.rol === "admin"){
btnAdmin.style.display =
"inline-block";
}else{
btnAdmin.style.display =
"none";
}

}

}else{

/* Sin sesión */
btnLogin.style.display =
"inline-block";

btnLogout.style.display =
"none";

btnAdmin.style.display =
"none";

saludo.innerText =
"Explora nuestros servicios 💅";

}

});

/* =========================================
IR LOGIN
========================================= */
window.irLogin = ()=>{

window.location.href =
"login.html";

};

/* =========================================
CERRAR SESIÓN
========================================= */
window.cerrarSesion = ()=>{

signOut(auth)
.then(()=>{

location.reload();

});

};

/* =========================================
CARRUSEL
========================================= */
document.addEventListener(
"DOMContentLoaded",
()=>{

const track =
document.getElementById("carouselTrack");

const btnNext =
document.getElementById("btnNext");

const btnPrev =
document.getElementById("btnPrev");

/* Siguiente */
function moveNext(){

const width =
track.getBoundingClientRect().width;

track.style.transition =
"transform 0.6s ease-in-out";

track.style.transform =
`translateX(-${width}px)`;

setTimeout(()=>{

track.style.transition =
"none";

track.appendChild(
track.firstElementChild
);

track.style.transform =
"translateX(0)";

},600);

}

/* Anterior */
function movePrev(){

const width =
track.getBoundingClientRect().width;

track.style.transition =
"none";

track.prepend(
track.lastElementChild
);

track.style.transform =
`translateX(-${width}px)`;

track.offsetHeight;

setTimeout(()=>{

track.style.transition =
"transform 0.6s ease-in-out";

track.style.transform =
"translateX(0)";

},10);

}

/* Eventos */
btnNext.addEventListener(
"click",
()=>{

moveNext();
resetAutoPlay();

});

btnPrev.addEventListener(
"click",
()=>{

movePrev();
resetAutoPlay();

});

/* Auto */
let autoPlay =
setInterval(
moveNext,
5000
);

/* Reiniciar */
function resetAutoPlay(){

clearInterval(autoPlay);

autoPlay =
setInterval(
moveNext,
5000
);

}

});




/* =========================================
PROMOCIONES (UI + FIREBASE - FIX FINAL)
========================================= */

document.addEventListener("DOMContentLoaded", ()=>{

/* ELEMENTOS */
const btnPromo = document.getElementById("btnPromoFloat");
const panelPromo = document.getElementById("panelPromo");
const overlay = document.getElementById("overlayPromo");
const cerrar = document.getElementById("cerrarPromo");

/* VALIDACIÓN */
if(!btnPromo || !panelPromo){
console.warn("Promo UI no encontrada");
return;
}

/* ABRIR PANEL */
btnPromo.addEventListener("click", ()=>{
panelPromo.classList.add("active");
if(overlay) overlay.classList.add("active");
});

/* CERRAR PANEL */
if(cerrar){
cerrar.addEventListener("click", cerrarPanel);
}

if(overlay){
overlay.addEventListener("click", cerrarPanel);
}

function cerrarPanel(){
panelPromo.classList.remove("active");
if(overlay) overlay.classList.remove("active");
}

/* =========================================
CARGAR PROMOS
========================================= */
async function cargarPromosIndex(){

const contenedor = document.getElementById("listaPromosIndex");

if(!contenedor) return;

try{

const snap = await getDocs(collection(db,"promociones"));

contenedor.innerHTML = "";

let contador = 0;

snap.forEach(docSnap=>{

const p = docSnap.data();

/* Solo activas */
if(!p.activa) return;

/* Máximo 3 */
if(contador >= 3) return;

contador++;

contenedor.innerHTML += `
<div class="promo-card-index">

<h4>${p.titulo}</h4>

<p class="promo-servicios-list">
${p.servicios.join(" + ")}
</p>

<p class="promo-precio">
$${Number(p.precioFinal).toLocaleString()}
</p>

<button onclick="usarPromo('${docSnap.id}')">
Reservar
</button>

</div>
`;

});

/* Sin promos */
if(contador === 0){
contenedor.innerHTML =
"<p style='text-align:center;'>No hay promociones activas 💔</p>";
}

}catch(error){
console.error("Error cargando promos:", error);
}

}

/* =========================================
USAR PROMO
========================================= */
window.usarPromo = async(id)=>{

try{

const snap = await getDoc(doc(db,"promociones",id));

if(!snap.exists()) return;

const promo = snap.data();

/* Guardar promo */
localStorage.setItem(
"promoActiva",
JSON.stringify(promo)
);

/* Redirigir */
window.location.href = "agendar.html";

}catch(error){

console.error("Error usando promo:", error);

}

};

/* INICIAR */
cargarPromosIndex();

});