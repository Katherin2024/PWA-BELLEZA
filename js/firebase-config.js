/* =========================================
IMPORTAR FIREBASE CORE
========================================= */
import {
initializeApp
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

/* =========================================
IMPORTAR SERVICIOS
========================================= */
import {
getAuth
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
getFirestore
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/* =========================================
CONFIGURACIÓN FIREBASE
========================================= */
const firebaseConfig = {
    apiKey: "AIzaSyCC2vUEI-xh4gbOYGBnUXFy4kl9jnsvK6c",
    authDomain: "pwabelleza-final.firebaseapp.com",
    projectId: "pwabelleza-final",
    storageBucket: "pwabelleza-final.firebasestorage.app",
    messagingSenderId: "5201396323",
    appId: "1:5201396323:web:ea9972086fa89784832e56",
    measurementId: "G-M7H883L2FB"
  };

/* =========================================
INICIALIZAR APP
========================================= */
const app =
initializeApp(firebaseConfig);

/* =========================================
SERVICIOS GLOBALES
========================================= */
const auth =
getAuth(app);

const db =
getFirestore(app);

/* =========================================
EXPORTAR
========================================= */
export {
app,
auth,
db
};
