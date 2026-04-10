// Importar Firestore
import { 
  getFirestore, 
  collection, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Importar app
import { app } from "./firebase-config.js";

// Inicializar DB
const db = getFirestore(app);

// Guardar cita
export const guardarCita = async (data) => {

  try {
    await addDoc(collection(db, "citas"), data);
    alert("Cita guardada en Firebase ✅");
  } catch (error) {
    alert(error.message);
  }

};