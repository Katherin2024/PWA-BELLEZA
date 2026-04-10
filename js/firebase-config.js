// Importar Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

// Configuración de Firebase
const firebaseConfig = {
      apiKey: "AIzaSyC7Q6Kvn0klC_OIByWIWe4-o7NiJ1D0SLQ",
      authDomain: "pwabelleza.firebaseapp.com",
      projectId: "pwabelleza",
      storageBucket: "pwabelleza.firebasestorage.app",
      messagingSenderId: "36813965033",
      appId: "1:36813965033:web:9b760c75eade1e2b079278",
      measurementId: "G-T8YZD0F5T0"
    };

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);