try {
  var express = require("express");
  console.log("\x1b[32m%s\x1b[0m", "express loaded successfully");
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", "failed to load express", error);
}
try {
  var http = require("http");
  console.log("\x1b[32m%s\x1b[0m", "http loaded successfully");
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", "failed to load http", error);
}
try {
  var socketIO = require("socket.io");
  console.log("\x1b[32m%s\x1b[0m", "socketIO loaded successfully");
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", "failed to load socketIO", error);
}
try {
  var cors = require("cors");
  console.log("\x1b[32m%s\x1b[0m", "cors loaded successfully");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "failed to load cors", error);
}
try {
  var app = express();
  console.log("\x1b[32m%s\x1b[0m", "express connected to app successfully");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "failed to apply express to app", error);
}
try {
  var server = http.createServer(app);
  console.log("\x1b[32m%s\x1b[0m", "app loaded successfully");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "failed to load server", error);
}
try {
  var io = socketIO(server);
  console.log("\x1b[32m%s\x1b[0m", "io loaded successfully");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "failed to load io", error);
}
try {
  var corsOptions = { origin: "" };
  console.log("\x1b[32m%s\x1b[0m", "corsOptions origin set successfully");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "setting corsOption origin failed", error);
}
try {
  var fs = require("fs");
  console.log("\x1b[32m%s\x1b[0m", "setting fs is successfull");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "setting fs failed", error);
}

import("node-fetch")
  .then(({ default: fetch }) => {})
  .catch((error) => {
    console.error("Failed to import node-fetch:", error);
  });
const numeric = require("numeric");
// What folders and files should be searched and used
app.use(express.static("public"));
app.use(cors(corsOptions));

// Start the server and listen on port 26001 for connections
const PORT = process.env.PORT || 26001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Defining the standard variables
let connected_users = [];
let users = [];

try {
  // Read user data from the JSON file
  const userData = fs.readFileSync("users.json", "utf-8");
  users = JSON.parse(userData);
} catch (err) {
  console.error("Error reading user data:", err);
}
connection = {};
const letters = "abcdefghijklmnopqrstuvwxyz";

io.on("connection", (socket) => {
  connection[socket.id] = {
    username: "",
    userId: "",
    key: "",
    models: {
      PSILARTEMP: {
        data: {},
      },
    },
  };

  // Logging the time of connection
  const originalTime = socket.handshake.time;
  const originalDate = new Date(originalTime);

  const formattedTime = originalDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(
    formattedTime,
    `A user connected with socket ID: ${
      socket.id
    } and their ip address is ${socket.handshake.address.replace(/^.*:/, "")}`
  );
  // How many users are connected
  connected_users.push({ socketId: socket.id });
  console.log(formattedTime, "Connected users:", connected_users.length);

  socket.on("login", ({ username, password }) => {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      // Successful login
      socket.emit("login_response", { success: true });
      const array = new Uint8Array(32);

      crypto.getRandomValues(array);

      connection[socket.id].key = "";
      Array.from(array).forEach((byte) => {
        if (byte % 2 === 0) {
          connection[socket.id].key += byte % 10;
        } else {
          connection[socket.id].key += letters.charAt(byte % letters.length);
        }
      });
      socket.emit("key", connection[socket.id].key);
      console.log(connection[socket.id].key);
    } else {
      // Invalid username or password
      socket.emit("login_response", { success: false });
    }
  });
  socket.on("requestData", (receivedkey) => {
    console.log("requestData received");
    console.log("received key as:", receivedkey);
    if (connection[socket.id].key === receivedkey) {
      console.log("requestData key accepted");
      requestData();
    } else {
      console.log("requestData key wrong");
      socket.emit("action-failed", {});
    }
  });
  socket.on("sendData", (receivedkey) => {
    console.log("sendData received");
    console.log("received key as:", receivedkey);
    if (connection[socket.id].key === receivedkey) {
      console.log("test-button sent");
      try {
        sendData(connection[socket.id].models.PSILARTEMP.data);
      } catch (error) {
        console.log(error);
      }
    } else {
      socket.emit("action-failed", {});
    }
  });
  function requestData() {
    console.log("requestData started as ", socket.id);
    const bearerToken = "asdfmjrtaADFG348RKVvnsarguja7df0";
    socket.emit("Processing");
    fetch(
      "http://portal.7sense.no:46000/v1/sensorunits/data?serialnumber=21-1065-AA-00001&timestart=2024-04-01",
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        timeout: 30000000,
        method: "GET",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        try {
          const result = data.result;
          const filteredData = result.filter((item) => item.probenumber === 1);

          // Log the filtered data
          // console.log("Filtered Data:", filteredData);
          formatData(filteredData);
        } catch (error) {}
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        socket.emit("RequestDataError", error);
      });
  }

  function formatData(data, addRandomDegrees = false, daysToPredict = 22) {
    const loginInfo = {
      username: "testuser",
      password: "testpass",
    };
    const modelId = "PSILARTEMP";
  
    // Extract timestamps and group by date
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.timestamp).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  
    // Create an array of dates and an array of corresponding temperature values
    const dates = Object.keys(groupedData).sort();
    const temperatureValues = dates.map((date) => {
      const targetHour = 16;
      let dataItem = groupedData[date].find(
        (item) => new Date(item.timestamp).getUTCHours() === targetHour
      );
      if (!dataItem) {
        dataItem = findClosestHourData(groupedData[date], targetHour);
      }
      return dataItem ? dataItem.value : null;
    });
  
    // Fill in missing dates and interpolate temperature values
    const allDates = [];
    const allTemperatureValues = [];
  
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    let currentDate = startDate;
  
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      allDates.push(dateString);
      const index = dates.indexOf(dateString);
      if (index !== -1) {
        allTemperatureValues.push(temperatureValues[index]);
      } else {
        allTemperatureValues.push(null);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    // Convert dates to numeric representation
    const dateNums = allDates.map((date) => new Date(date).getTime());
    const nonNullDateNums = dateNums.filter(
      (_, i) => allTemperatureValues[i] !== null
    );
    const nonNullTemps = allTemperatureValues.filter((value) => value !== null);
  
    // Perform spline interpolation using numeric.js
    const spline = numeric.spline(nonNullDateNums, nonNullTemps);
  
    const interpolatedValues = dateNums.map((dateNum, index) => {
      if (allTemperatureValues[index] !== null) {
        return allTemperatureValues[index];
      } else {
        return spline.at(dateNum);
      }
    });
  
    // Add random degrees for testing if the flag is true
    const testTemperatureValues = interpolatedValues.map((value) => {
      if (addRandomDegrees) {
        const randomIncrease = Math.random() + 20; // Adds between 0 and 2 degrees
        return value + randomIncrease;
      }
      return value;
    });
  
    // Predict future days based on a linear trend of the last 5 days
    const lastFiveDates = dateNums.slice(-5);
    const lastFiveTemps = testTemperatureValues.slice(-5);
  
    // Simple linear regression
    const n = lastFiveDates.length;
    const sumX = lastFiveDates.reduce((a, b) => a + b, 0);
    const sumY = lastFiveTemps.reduce((a, b) => a + b, 0);
    const sumXY = lastFiveDates.reduce(
      (sum, x, i) => sum + x * lastFiveTemps[i],
      0
    );
    const sumXX = lastFiveDates.reduce((sum, x) => sum + x * x, 0);
  
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
  
    for (let i = 1; i <= daysToPredict; i++) {
      const nextDate = new Date(endDate);
      nextDate.setDate(nextDate.getDate() + i);
      const nextDateNum = nextDate.getTime();
      const predictedValue = slope * nextDateNum + intercept;
  
      const nextDateString = nextDate.toISOString().split("T")[0];
      allDates.push(nextDateString);
      testTemperatureValues.push(predictedValue);
    }
  
    // Create observations
    const observations = allDates.map((date, index) => {
      const timeMeasured = `${date}T16:00:00Z`;
      return {
        elementMeasurementTypeId: "TM",
        logIntervalId: 2,
        timeMeasured: timeMeasured,
        value: testTemperatureValues[index],
      };
    });
  
    const formattedData = {
      loginInfo: loginInfo,
      modelId: modelId,
      configParameters: {
        timeZone: "Europe/Oslo",
        observations: observations,
      },
    };
    socket.emit("data-formatted");
    connection[socket.id].models.PSILARTEMP.data = formattedData;
    socket.emit("temperature", connection[socket.id].models.PSILARTEMP.data);
    // sendData(formattedData);
    fs.writeFile(
      "formatdata.json",
      JSON.stringify(formattedData, null, 2),
      "utf-8",
      (err) => {
        if (err) {
          console.error("Error writing to formatdata.json:", err);
        } else {
          console.log("Data has been written to formatdata.json");
        }
      }
    );
  }
  

  // Helper function to find the closest hour data
  function findClosestHourData(dateData, targetHour) {
    const hours = dateData.map((item) =>
      new Date(item.timestamp).getUTCHours()
    );
    let closestHour = null;
    let closestDifference = Infinity;

    hours.forEach((hour) => {
      const difference = Math.abs(hour - targetHour);
      if (difference < closestDifference) {
        closestDifference = difference;
        closestHour = hour;
      }
    });

    return dateData.find(
      (item) => new Date(item.timestamp).getUTCHours() === closestHour
    );
  }

  // Helper function to find the closest hour data

  function sendData(data) {
    try {
      // console.log(JSON.stringify(data));
      console.log("Senddata data above");
      console.log("sendData startet as", socket.id);

      fetch("https://coremanager.testvips.nibio.no/models/PSILARTEMP/run", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          console.log("RESPONSE HERE", response);
          return response.json();
        })
        .then((data) => {
          try {
            fs.writeFile(
              "receiveddata.json",
              JSON.stringify(data, null, 2),
              "utf-8",
              (err) => {
                if (err) {
                  console.error("Error writing to receiveddata.json:", err);
                } else {
                  console.log("Data has been written to receiveddata.json");
                }
              }
            );
            data.forEach((data) => {
              // Extracting date from validTimeStart
              const date = new Date(data.validTimeStart);
              const formattedDate = date.toISOString().split("T")[0]; // Extracting YYYY-MM-DD

              // Extracting warning status
              const warningStatus = data.warningStatus;

              // Emitting an object containing the date and warning status
              socket.emit("sensor-data", {
                date: formattedDate,
                warningStatus: warningStatus,
              });
            });
          } catch (error) {
            console.log(error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  socket.on("disconnect", () => {
    const disconnectedUser = connected_users.find(
      (user) => user.socketId === socket.id
    );
    if (disconnectedUser) {
      connected_users = connected_users.filter(
        (user) => user.socketId !== socket.id
      );
      console.log(
        formattedTime,
        `User with socket ID: ${socket.id} disconnected.`
      );
      console.log(formattedTime, "Connected users:", connected_users.length);
    }
    connection[socket.id].key = "disconnected";
  });
});
