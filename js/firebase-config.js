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

apiKey:
"AIzaSyC7Q6Kvn0klC_OIByWIWe4-o7NiJ1D0SLQ",

authDomain:
"pwabelleza.firebaseapp.com",

projectId:
"pwabelleza",

storageBucket:
"pwabelleza.firebasestorage.app",

messagingSenderId:
"36813965033",

appId:
"1:36813965033:web:9b760c75eade1e2b079278",

measurementId:
"G-T8YZD0F5T0"

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
