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

// Funzione per rilevare il movimento analizzando i frame
let lastFrameData = null;

function detectMovement(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = video.width;
    const height = video.height;

    canvas.width = width;
    canvas.height = height;

    const detect = () => {
        context.drawImage(video, 0, 0, width, height);
        const frameData = context.getImageData(0, 0, width, height);
        
        if (lastFrameData) {
            const movementDetected = checkForMovement(lastFrameData.data, frameData.data, width, height);
            if (movementDetected) {
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
        }
        
        lastFrameData = frameData;
        requestAnimationFrame(detect); // Continua a rilevare il movimento
    };

    detect();
}

// Funzione per controllare se c'è movimento tra due frame
function checkForMovement(lastData, currentData, width, height) {
    const threshold = 100; // Soglia di movimento
    let movement = false;

    for (let i = 0; i < lastData.length; i += 4) {
        const rDiff = Math.abs(lastData[i] - currentData[i]);
        const gDiff = Math.abs(lastData[i + 1] - currentData[i + 1]);
        const bDiff = Math.abs(lastData[i + 2] - currentData[i + 2]);
        
        if (rDiff + gDiff + bDiff > threshold) {
            movement = true;
            break;
        }
    }
    
    return movement;
}
