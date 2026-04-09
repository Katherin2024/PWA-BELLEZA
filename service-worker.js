// Evento que se ejecuta cuando se instala la PWA
self.addEventListener("install", event => {
  console.log("Service Worker instalado");
});

// Evento cuando la app está activa
self.addEventListener("activate", event => {
  console.log("Service Worker activado");
});

// Intercepta peticiones (para offline en el futuro)
self.addEventListener("fetch", event => {
  // Aquí luego puedes agregar cache
});