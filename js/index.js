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
getDoc
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