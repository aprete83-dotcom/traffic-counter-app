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
