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
const users = [
  { username: "1", password: "1" },
  { username: "user2", password: "password2" },
];
connection = {};
const letters = "abcdefghijklmnopqrstuvwxyz";

io.on("connection", (socket) => {
  connection[socket.id] = {
    username: "",
    password: "",
    key: "",
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
  socket.on("displaymap", (data, receivedkey) => {
    console.log("displaymap received")
    console.log("received data as:", data)
    console.log("received key as:", receivedkey)
    if (connection[socket.id].key === receivedkey) {
      socket.emit("test-button", connection[socket.id].key);
      console.log("test-button sent");
    } else {
      socket.emit("action-failed", {});
    }
  })







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
