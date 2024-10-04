let timer = null;
let startTime = 0;
let isArmed = false;

document.getElementById('armButton').addEventListener('click', () => {
    isArmed = !isArmed;  // Toggle the armed state
    const statusElement = document.getElementById('status');
    statusElement.textContent = isArmed ? 'Status: Attivo' : 'Status: Non attivo';
    
    if (isArmed) {
        // Se è attivato, inizia il monitoraggio
        startMovementDetection();
    } else {
        // Se disattivato, ferma il monitoraggio
        stopMovementDetection();
    }
});

function startMovementDetection() {
    const video = document.getElementById('video');
    const constraints = {
        video: true
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            video.play();
            detectMovement(video);
        })
        .catch(error => console.error('Errore nell\'accesso alla fotocamera:', error));
}

function stopMovementDetection() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    startTime = 0;
    document.getElementById('timeDisplay').textContent = 'Tempo: 0 secondi';
}

// Funzione per rilevare il movimento usando tracking.js
function detectMovement(video) {
    tracking.track(video, new tracking.ColorTracker(['aqua', 'cyan', 'green', 'orange', 'red']), { camera: true });

    tracking.on('track', (event) => {
        if (event.data.length > 0) {
            if (isArmed && startTime === 0) {
                startTime = Date.now();
                document.getElementById('timeDisplay').textContent = `Tempo: 0 secondi`;
                console.log('Primo movimento rilevato');
            } else if (isArmed && startTime > 0) {
                const elapsedTime = (Date.now() - startTime) / 1000; // Calcola il tempo in secondi
                document.getElementById('timeDisplay').textContent = `Tempo: ${elapsedTime.toFixed(2)} secondi`;
                console.log('Secondo movimento rilevato');
                stopMovementDetection(); // Ferma il timer dopo aver rilevato il secondo movimento
            }
        }
    });
}
