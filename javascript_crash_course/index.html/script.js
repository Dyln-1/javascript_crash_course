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

function startVisualizer() {
    if (audioSource) {
        audioSource.disconnect();
    }

    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 5;

    function animate() {
        let x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 1.5 + 3;
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(i + Math.PI * 3 / bufferLength);
            const hue = i * 0.5;
            ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/2 + '%)';
            ctx.fillRect(0, 0, barWidth, barHeight);
            x += barWidth;
            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

container.addEventListener('click', () => {
    audio1.play();
    startVisualizer();
});

file.addEventListener('change', function () {
    const files = this.files;
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();
    startVisualizer();
});
