const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
const audio1 = document.getElementById('audio1');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioSource;
let analyser;
let baseHue = 0;
function changeColorOnClick(){
    baseHue = Math.floor(Math.random() * 360);
}

function startVisualizer() {
    if (audioSource || analyser) return;

    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 2;

    function animate() {
        let x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        console.log(dataArray.slice(0, 10))
       
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 1.4 + 3;
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(i * rotationSpeed + Math.PI * 2 / bufferLength);
            const hue = (baseHue + i * 0.5);
            ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/2 + '%)';
            ctx.fillRect(0, 0, barWidth, barHeight);
            x += barWidth;
            ctx.restore();
        }

        analyser.getByteFrequencyData(dataArray);
        if (dataArray.every(val => val === 0)) {
            console.warn("AudioContext may be suspended or not connected properly");
        }

        requestAnimationFrame(animate);
    }

    animate();
}

container.addEventListener('click', async () => {
    if (audioContext.state === 'suspended'){
    await audioContext.resume();
    }
    
    if (!audioSource || !analyser){
        startVisualizer();
    }

    audio1.play();
    changeColorOnClick();
});

canvas.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            const percentage = mouseX / window.innerWidth;
            rotationSpeed = 0.001 + percentage * 0.05;
        });

canvas.addEventListener('click', () =>{
    changeColorOnClick();
});

file.addEventListener('change', async function () {
    const files = this.files;
    if (files.length > 0) {
    audio1.src = URL.createObjectURL(files[0]);
    await audio1.load();
    await audioContext.resume();
   
    audio1.play();
    startVisualizer();
    }
});

