let peopleCount = 0;
let vehicleCount = 0;
let model = null;

let trackedVehicles = [];
let nextVehicleId = 1;

const vehicleTypes = ["car", "truck", "bus", "motorcycle", "bicycle"];
const confidenceThreshold = 0.10;
const linePosition = 0.70; // 70% across the video

function updateDashboard() {
  document.getElementById("people-count").textContent = peopleCount;
  document.getElementById("vehicle-count").textContent = vehicleCount;
}

function simulatePerson() {
  peopleCount++;
  updateDashboard();
}

function simulateVehicle() {
  vehicleCount++;
  updateDashboard();
}

function resetCounts() {
  peopleCount = 0;
  vehicleCount = 0;
  trackedVehicles = [];
  nextVehicleId = 1;
  updateDashboard();
}

async function loadModel() {
  const status = document.querySelector(".status");
  status.textContent = "Loading detection model...";

  model = await cocoSsd.load({
    base: "mobilenet_v2"
  });

  status.textContent = "Detection model loaded. Play the video to start vehicle counting.";
}

function setupCanvas() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
}

function drawCountingLine(ctx, canvas) {
  const lineX = canvas.width * linePosition;

  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, canvas.height);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "red";
  ctx.stroke();

  ctx.font = "18px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Counting Line", lineX - 120, 30);
}

function findClosestVehicle(centerX, centerY) {
  let closestVehicle = null;
  let closestDistance = Infinity;

  trackedVehicles.forEach(vehicle => {
    const dx = centerX - vehicle.centerX;
    const dy = centerY - vehicle.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance && distance < 120) {
      closestDistance = distance;
      closestVehicle = vehicle;
    }
  });

  return closestVehicle;
}

async function detectObjects() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  setupCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCountingLine(ctx, canvas);

  if (model && !video.paused && !video.ended) {
    const predictions = await model.detect(video);
    const lineX = canvas.width * linePosition;
    const currentVehicles = [];

    predictions.forEach(prediction => {
      if (prediction.score < confidenceThreshold) {
        return;
      }

      const objectName = prediction.class;

      if (vehicleTypes.includes(objectName)) {
        const [x, y, width, height] = prediction.bbox;

        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        const drawX = x * scaleX;
        const drawY = y * scaleY;
        const drawWidth = width * scaleX;
        const drawHeight = height * scaleY;

        const centerX = drawX + drawWidth / 2;
        const centerY = drawY + drawHeight / 2;

        let vehicle = findClosestVehicle(centerX, centerY);

        if (!vehicle) {
          vehicle = {
            id: nextVehicleId++,
            centerX: centerX,
            centerY: centerY,
            counted: false
          };
        }

        // Count only when moving left to right across the line
        if (!vehicle.counted && vehicle.centerX < lineX && centerX >= lineX) {
          vehicleCount++;
          vehicle.counted = true;
          updateDashboard();
        }

        vehicle.centerX = centerX;
        vehicle.centerY = centerY;

        currentVehicles.push(vehicle);

        ctx.beginPath();
        ctx.rect(drawX, drawY, drawWidth, drawHeight);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "yellow";
        ctx.stroke();

        ctx.fillStyle = "yellow";
        ctx.font = "16px Arial";
        ctx.fillText(
          `${objectName} ${(prediction.score * 100).toFixed(0)}%`,
          drawX,
          drawY > 20 ? drawY - 5 : drawY + 20
        );

        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });

    trackedVehicles = currentVehicles;
  }

  requestAnimationFrame(detectObjects);
}

window.addEventListener("load", async () => {
  setupCanvas();
  updateDashboard();
  await loadModel();
  detectObjects();
});

window.addEventListener("resize", setupCanvas);
