/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getAuth,
signInWithEmailAndPassword,
sendPasswordResetEmail
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
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

/* =========================================
MOSTRAR / OCULTAR CLAVE
========================================= */
window.mostrarClave = ()=>{

const pass =
document.getElementById("password");

/* Cambiar tipo */
pass.type =
pass.type === "password"
? "text"
: "password";

};

/* =========================================
INICIAR SESIÓN
========================================= */
window.iniciarSesion =
async()=>{

/* Capturar datos */
const email =
document.getElementById("email")
.value;

const password =
document.getElementById("password")
.value;

/* Validar */
if(
!email ||
!password
){

alert(
"Completa los campos ⚠️"
);

return;

}

try{

/* Login Firebase */
const userCredential =
await signInWithEmailAndPassword(
auth,
email,
password
);

const user =
userCredential.user;

/* Buscar datos usuario */
const docSnap =
await getDoc(
doc(db,"usuarios",user.uid)
);

/* Si existe */
if(docSnap.exists()){

const data =
docSnap.data();

/* Redirección según rol */
if(data.rol === "admin"){

window.location.href =
"admin.html";

}else{

window.location.href =
"index.html";

}

}

}catch(error){

alert(
"Error: " +
error.message
);

}

};

/* =========================================
RECUPERAR CONTRASEÑA
========================================= */
window.recuperarPassword =
async()=>{

const email =
document.getElementById("email")
.value;

/* Validar correo */
if(!email){

alert(
"Ingresa tu correo primero 📧"
);

return;

}

try{

/* Enviar correo reset */
await sendPasswordResetEmail(
auth,
email
);

alert(
"Correo enviado 💌"
);

}catch(error){

alert(
"Error: " +
error.message
);

}

};

/* =========================================
VOLVER
========================================= */
window.volver = ()=>{

window.location.href =
"index.html";

};
