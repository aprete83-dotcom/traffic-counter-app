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

  model = await cocoSsd.load();

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
      if (prediction.score < 0.70) {
  return;
}
      const objectName = prediction.class;

      if (objectName === "person" || vehicleTypes.includes(objectName)) {
        const [x, y, width, height] = prediction.bbox;

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = 3;
        ctx.strokeStyle = objectName === "person" ? "lime" : "yellow";
        ctx.stroke();

        ctx.fillStyle = objectName === "person" ? "lime" : "yellow";
        ctx.font = "16px Arial";
        ctx.fillText(
          `${objectName} ${(prediction.score * 100).toFixed(0)}%`,
          x,
          y > 20 ? y - 5 : y + 20
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
