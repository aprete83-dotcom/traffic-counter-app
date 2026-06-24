let peopleCount = 0;
let vehicleCount = 0;

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
  updateDashboard();
}
function setupCanvas() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Test counting line
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.65);
  ctx.lineTo(canvas.width, canvas.height * 0.65);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "red";
  ctx.stroke();

  ctx.font = "18px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Counting Line", 20, canvas.height * 0.65 - 10);
}

window.addEventListener("load", setupCanvas);
window.addEventListener("resize", setupCanvas);
