const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const nameToSocketMap = new Map(); // Modified to store additional user data
const socketidToUserDataMap = new Map(); // Modified to store additional user data

//Establish the connection
io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on("chat", (message) => {
    io.emit("message", message);
  });

  //Taking info of user and include in our map
  socket.on("room:join", (data) => {
    const { name, room } = data;
    console.log("name:::::", name, "Room::::", room);

    // Add user data to maps
    nameToSocketMap.set(socket.id, {
      id: socket.id,
      name: name,
      inCall: false,
    }); // Set inCall flag to false initially
    socketidToUserDataMap.set(socket.id, { name, inCall: false }); // Set inCall flag to false initially

    socket.join(room);
    io.to(room).emit("user:joined", { name, id: socket.id });

    // Emit user IDs to the client
    io.to(socket.id).emit("room:join", { ...data, id: socket.id });
    io.to(socket.id).emit("user:ids", {
      nameToSocketMap: Array.from(nameToSocketMap),
      socketidToUserDataMap: Array.from(socketidToUserDataMap),
    });
  });

  //Call the user and create offer
  socket.on("user:call", ({ to, offer }) => {
    const toUserData = nameToSocketMap.get(to);
    console.log(nameToSocketMap);
    console.log("toUserData:: ", toUserData);
    console.log("to:: ", to);
    if (toUserData && !toUserData.inCall) {
      io.to(toUserData.id).emit("incomming:call", {
        from: socket.id,
        offer,
        userId: socket.id,
      });

      // Broadcast the call ID to all users in the room
      socket.broadcast.emit("user:call", {
        to: toUserData.id,
        offer,
        userId: socket.id,
      });
    } else {
      io.to(socket.id).emit("error", {
        message: "User not available for call",
      });
    }
  });

  //call are accepted
  socket.on("call:accepted", ({ to, ans }) => {
    const toUserData = nameToSocketMap.get(to);
    if (toUserData && !toUserData.inCall) {
      io.to(toUserData.id).emit("call:accepted", {
        from: socket.id,
        ans,
        userId: socket.id,
      });
    } else {
      io.to(socket.id).emit("error", {
        message: "User not available for call",
      });
    }
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    const toUserData = nameToSocketMap.get(to);
    if (toUserData && !toUserData.inCall) {
      io.to(toUserData.id).emit("peer:nego:needed", { from: socket.id, offer });
    } else {
      io.to(socket.id).emit("error", {
        message: "User not available for call",
      });
    }
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    const toUserData = nameToSocketMap.get(to);
    if (toUserData && !toUserData.inCall) {
      io.to(toUserData.id).emit("peer:nego:final", { from: socket.id, ans });
    } else {
      io.to(socket.id).emit("error", {
        message: "User not available for call",
      });
    }
  });

  // Handle screen sharing events
  socket.on("screen:share", (data) => {
    const toUserData = nameToSocketMap.get(data.to);
    if (toUserData && !toUserData.inCall) {
      io.to(toUserData.id).emit("screen:shared", {
        screenData: data.screenData,
        userId: socket.id,
      });

      // Broadcast the screen share ID to all users in the room
      socket.broadcast.emit("screen:share", {
        room,
        screenData,
        userId: socket.id,
      });
    } else {
      io.to(socket.id).emit("error", {
        message: "User not available for screen share",
      });
    }
  });
});
