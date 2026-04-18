document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("carouselTrack");
    const btnNext = document.getElementById("btnNext");
    const btnPrev = document.getElementById("btnPrev");

    function moveNext() {
        // Obtenemos el ancho exacto del contenedor en ese momento
        const width = track.getBoundingClientRect().width;
        
        track.style.transition = "transform 0.6s ease-in-out";
        track.style.transform = `translateX(-${width}px)`; // Usamos px exactos en lugar de %

        setTimeout(() => {
            track.style.transition = "none";
            track.appendChild(track.firstElementChild); // Movemos al final
            track.style.transform = "translateX(0)";
        }, 600);
    }

    function movePrev() {
        const width = track.getBoundingClientRect().width;

        track.style.transition = "none";
        track.prepend(track.lastElementChild); // Movemos al inicio
        track.style.transform = `translateX(-${width}px)`;

        // Forzamos un "reflow" para que el navegador registre el cambio de posición
        track.offsetHeight; 

        setTimeout(() => {
            track.style.transition = "transform 0.6s ease-in-out";
            track.style.transform = "translateX(0)";
        }, 10);
    }

    btnNext.addEventListener("click", () => {
        moveNext();
        resetAutoPlay();
    });

    btnPrev.addEventListener("click", () => {
        movePrev();
        resetAutoPlay();
    });

    let autoPlay = setInterval(moveNext, 5000);

    function resetAutoPlay() {
        clearInterval(autoPlay);
        autoPlay = setInterval(moveNext, 5000);
    }
});