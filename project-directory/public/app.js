// -------------------------Server.js---------------------------------------
const socket = io("localhost:26001", { transports: ["websocket"] });
// Handling connection errors
socket.on("connect_error", (error) => {
  console.error("Error connecting to the server:", error.message);
});

socket.on("connect", () => {
  console.log("Connected to the server");
});
let currentkey = undefined;
let temp = undefined;

socket.on("disconnect", () => {
  console.error("Disconnected from the server");
  console.log("Disconnected from the server");
});
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send username and password to the server for verification
    socket.emit("login", { username, password });
    console.log("Submitted username and password");
  });
});

// Handle the server response
socket.on("login_response", function (data) {
  if (data.success) {
    console.log("Successfully logged in");
    document.getElementById("login-container").style.display = "none";
    document.getElementById("mainpage").style.display = "block";
  } else {
    alert("Invalid username or password. Please try again.");
  }
});
socket.on("key", (data) => {
  console.log("Received key:", data);
  currentkey = data;
});

function displaymap() {
  socket.emit("displaymap", currentkey);
}

socket.on("test-button", (data) => {
  document.getElementById("mapdata").innerText = data;
  console.log(data, "received");
});

const sensorDataDiv = document.getElementById("sensorData");

socket.on("sensor-data", (data) => {
  console.log("Received sensor data:", data);
  // Create a <p> element to display each sensor data
  const sensorDataElement = document.createElement("p");

  // Set the text content of the <p> element to the received data
  sensorDataElement.innerText = `${data.date} ${data.warningStatus}`;

  // Append the <p> element to the sensorDataDiv
  sensorDataDiv.appendChild(sensorDataElement);
});