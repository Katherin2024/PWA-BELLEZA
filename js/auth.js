// Importar funciones de autenticación
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// Importar app
import { app } from "./firebase-config.js";

// Inicializar auth
const auth = getAuth(app);

// Registro
export const registrar = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Recuperar contraseña
export const recuperarPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};