// Importar Firebase Firestore
import { 
  getFirestore, 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Importar app
import { app } from "./firebase-config.js";

// Inicializar base de datos
const db = getFirestore(app);

// ================= FUNCIÓN =================
export async function cargarServicios() {

  try {

    // Referencia a colección
    const querySnapshot = await getDocs(collection(db, "servicios"));

    let html = "";

    // Si NO hay datos
    if (querySnapshot.empty) {
      html = "<p style='text-align:center;'>No hay servicios registrados 💔</p>";
    }

    // Recorrer datos
    querySnapshot.forEach(doc => {

      const servicio = doc.data();

      html += `
        <div class="servicio">
          <h3>${servicio.nombre}</h3>
          <p>💰 $${servicio.precio}</p>
          <p>⏱ ${servicio.duracion}</p>

          <button onclick="agendar('${servicio.nombre}')">
            Agendar
          </button>
        </div>
      `;

    });

    // Mostrar en pantalla
    document.getElementById("listaServicios").innerHTML = html;

  } catch (error) {

    console.error("Error cargando servicios:", error);

    document.getElementById("listaServicios").innerHTML =
      "<p style='color:red;text-align:center;'>Error cargando servicios ❌</p>";
  }

}