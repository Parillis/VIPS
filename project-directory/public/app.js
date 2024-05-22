// -------------------------Server.js---------------------------------------
const socket = io("http://51.174.112.205:26001/", { transports: ["websocket"] });
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
  requestData()
});

function sendData() {
  socket.emit("sendData", currentkey);
}
function requestData() {
  socket.emit("requestData", currentkey);
  console.log("Request data sent");
}

const sensorDataDiv = document.getElementById("sensorData");

document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("myChart").getContext("2d");

  // Initialize arrays to store date and warning status data
  const dates = [];
  const warningStatuses = [];

  // Define chart variable outside the event listener
  let chart;

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates, // Use dates as labels for x-axis
      datasets: [
        {
          label: "Warning Status",
          data: warningStatuses, // Use warning statuses as data for y-axis
          borderWidth: 2,
          fill: false,
          // pointRadius: 0,
          pointcolor: "red",
          segment: {
            borderColor: (ctx) => {
              const index = ctx.p0DataIndex;
              switch (warningStatuses[index]) {
                case 2:
                  return "blue";
                case 3:
                  return "yellow";
                case 4:
                  return "red";
                default:
                  return "gray";
              }
            },
          },
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 5, // Start the y-axis at 0
          title: {
            display: true,
            text: "Warning Status",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
      elements: {
        line: {
          tension: 0,
        },
      },
    },
  });

  // Listen for 'sensor-data' event from the server
  socket.on("sensor-data", (data) => {
    console.log("Received sensor data:", data);
    document.getElementById("SendDataStatus").innerText =
      "Sending data successful, data received";
    if (timesSent <= 16) {
      timesSent = timesSent + 1;
      dates.push(data.date);
      warningStatuses.push(data.warningStatus);
      updateChart();
    } else if (timesSent >= 17) {
      timesSent = 0
      console.log("TimesSent",timesSent)
      dates.splice(0, dates.length);
      warningStatuses.splice(0, warningStatuses.length);
      updateChart();
    }

    // Update the chart with the new data
  });

  function updateChart() {
    // Update the chart's datasets with the new data
    chart.data.labels = dates;
    chart.data.datasets[0].data = warningStatuses;

    document.getElementById("myChart").style.display = "block";
    // Update the chart
    chart.update();
  }
});
timesSent = 0;
socket.on("SendDataError404", (data) => {
  // document.getElementById("SendDataStatus").innerText =
  //   "Sending Data error 404: No Saved Data";
  console.log("Sending Data error 404: No Saved Data");
});
socket.on("RequestDataError", (data) => {
  // document.getElementById("RequestDataStatus").innerText =
  //   "Reqesting Data failed:" + JSON.stringify(data);
  console.log("Reqesting Data failed:" + JSON.stringify(data));
});
socket.on("Processing", (data) => {
  // document.getElementById("RequestDataStatus").innerText = "Processing Data";
  console.log("Processing Data")
});

socket.on("data-formatted", (data) => {
  console.log("Data processing complete")
  // document.getElementById("RequestDataStatus").innerText =
  //   "Data processing complete";
  sendData()
});
