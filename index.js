const io = require("socket.io")(9000, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  console.log("arr length is ", users.length);
  if (users.length === 0) {
    users.push({ userId, socketId });
  }
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const findReceverId = (receverId) =>
  users.find((user) => user.userId === receverId);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("addUser", (userId) => {
    //console.log("userId", userId);
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    //console.log(users);
  });

  //send message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log(senderId, receiverId, text);
    const user = findReceverId(receiverId); //finding receiver id from user array
    //console.log("receiver user-->", user);
    if (user !== undefined) {
      io.to(user.socketId).emit("getMessage", {
        receiverId,
        senderId,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});
