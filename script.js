let peopleCount = 0;
let vehicleCount = 0;
let model = null;

const vehicleTypes = ["car", "truck", "bus", "motorcycle", "bicycle"];

function updateDashboard() {
  document.getElementById("people-count").textContent = peopleCount;
  document.getElementById("vehicle-count").textContent = vehicleCount;
}

function resetCounts() {
  peopleCount = 0;
  vehicleCount = 0;
  updateDashboard();
}

async function loadModel() {
  const status = document.querySelector(".status");
  status.textContent = "Loading detection model...";

  model = await cocoSsd.load({
  base: "mobilenet_v2"
});

  status.textContent = "Detection model loaded. Play the video to start detection.";
}

function setupCanvas() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
}

async function detectObjects() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  setupCanvas();

  if (model && !video.paused && !video.ended) {
    const predictions = await model.detect(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw counting line
    ctx.beginPath();
ctx.moveTo(canvas.width * 0.70, 0);
ctx.lineTo(canvas.width * 0.70, canvas.height);
ctx.lineWidth = 4;
ctx.strokeStyle = "red";
ctx.stroke();

ctx.font = "18px Arial";
ctx.fillStyle = "red";
ctx.fillText("Counting Line", canvas.width * 0.70 - 120, 30);

    predictions.forEach(prediction => {
      if (prediction.score < 0.10) {
  return;
}
      const objectName = prediction.class;

      if (vehicleTypes.includes(objectName)) {
        const [x, y, width, height] = prediction.bbox;

// Scale detection box from real video size to canvas size
const scaleX = canvas.width / video.videoWidth;
const scaleY = canvas.height / video.videoHeight;

const drawX = x * scaleX;
const drawY = y * scaleY;
const drawWidth = width * scaleX;
const drawHeight = height * scaleY;

        ctx.beginPath();
        ctx.rect(drawX, drawY, drawWidth, drawHeight);
        ctx.lineWidth = 3;
        ctx.strokeStyle = objectName === "person" ? "lime" : "yellow";
        ctx.stroke();

        ctx.fillStyle = objectName === "yellow";
        ctx.font = "16px Arial";
        ctx.fillText(
  `${objectName} ${(prediction.score * 100).toFixed(0)}%`,
  drawX,
  drawY > 20 ? drawY - 5 : drawY + 20
);
      }
    });
  }

  requestAnimationFrame(detectObjects);
}

window.addEventListener("load", async () => {
  setupCanvas();
  await loadModel();
  detectObjects();
});

window.addEventListener("resize", setupCanvas);
