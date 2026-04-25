/* =========================================
IMPORTAR FIREBASE
========================================= */
import {
getAuth,
createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc
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
MOSTRAR / OCULTAR CLAVE
========================================= */
window.mostrarClave = ()=>{

const pass =
document.getElementById("password");

pass.type =
pass.type === "password"
? "text"
: "password";

};

/* =========================================
REGISTRAR USUARIO
========================================= */
window.registrarUsuario =
async()=>{

const nombre =
document.getElementById("nombre").value.trim();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

const telefono =
document.getElementById("telefono").value.trim();

const direccion1 =
document.getElementById("direccion1").value.trim();

const direccion2 =
document.getElementById("direccion2").value.trim();

/* Validar */
if(
!nombre ||
!email ||
!password ||
!telefono ||
!direccion1
){

alert(
"Completa todos los campos ⚠️"
);

return;

}

/* Contraseña */
if(password.length < 6){

alert(
"Mínimo 6 caracteres 🔒"
);

return;

}

try{

const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);

const user =
userCredential.user;

/* Guardar usuario */
await setDoc(
doc(db,"usuarios",user.uid),
{
nombre:nombre,
email:email,
telefono:telefono,
direccion1:direccion1,
direccion2:direccion2
}
);

alert(
"Registro exitoso 💖"
);

window.location.href =
"login.html";

}catch(error){

alert(
"Error: " +
error.message
);

}

};