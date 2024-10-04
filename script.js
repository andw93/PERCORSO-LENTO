let isArmed = false;
let timer = null;
let startTime = 0;
let lastFrameTime = 0;

document.getElementById('armButton').addEventListener('click', () => {
    isArmed = !isArmed;  // Toggle the armed state
    const statusElement = document.getElementById('status');
    statusElement.textContent = isArmed ? 'Status: Attivo' : 'Status: Non attivo';
    
    if (isArmed) {
        startMovementDetection();
    } else {
        stopMovementDetection();
    }
});

function startMovementDetection() {
    const video = document.getElementById('video');
    const constraints = { video: true };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            video.play();
            detectMovement();
        })
        .catch(error => console.error('Errore nell\'accesso alla fotocamera:', error));
}

function stopMovementDetection() {
    clearInterval(timer);
    startTime = 0;
    document.getElementById('timeDisplay').textContent = 'Tempo: 0 secondi';
}

function detectMovement() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    lastFrameTime = performance.now();

    const checkForMovement = () => {
        context.drawImage(video, 0, 0);
        const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Calcola il movimento
        if (isArmed) {
            let totalMovement = 0;

            for (let i = 0; i < currentFrame.data.length; i += 4) {
                // Calcola la differenza tra il frame attuale e il frame precedente
                if (currentFrame.data[i + 3] > 0) {
                    totalMovement += currentFrame.data[i]; // R, G, B
                }
            }

            if (totalMovement > 100000) { // Soglia di movimento
                if (startTime === 0) {
                    startTime = Date.now();
                    timer = setInterval(updateTimer, 100); // Avvia il timer
                    console.log('Movimento rilevato! Timer avviato.');
                }
            } else if (startTime > 0) {
                // Se il movimento si ferma, ferma il timer
                stopMovementDetection();
                console.log('Movimento fermato! Timer fermato.');
            }
        }

        requestAnimationFrame(checkForMovement);
    };

    checkForMovement();
}

function updateTimer() {
    const elapsedTime = (Date.now() - startTime) / 1000; // Calcola il tempo in secondi
    document.getElementById('timeDisplay').textContent = `Tempo: ${elapsedTime.toFixed(2)} secondi`;
}
