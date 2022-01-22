const io = require("socket.io")(9000, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

let users = [];

const sendStatusToDb = async (userId, status) => {
  try {
    await axios.default
      .get(`${process.env.BACKEND_URL}/user/status/${userId}?status=${status}`)
      .then((res) => {
        console.log("res is ", res.data);
      });
  } catch (error) {
    console.log("failed to send status to db...", error);
  }
};

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
    sendStatusToDb(userId, true);
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    //console.log(users);
  });

  //send message
  socket.on("sendMessage", ({ senderId, receiverId, conversationId, text }) => {
    console.log(senderId, receiverId, text);
    const user = findReceverId(receiverId); //finding receiver id from user array
    //console.log("receiver user-->", user);
    if (user !== undefined) {
      io.to(user.socketId).emit("getMessage", {
        receiverId,
        senderId,
        conversationId,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    users = users.filter((user) => {
      if (user.socketId === socket.id) {
        sendStatusToDb(user.userId, false);
      }
      return user.socketId !== socket.id;
    });
    io.emit("getUsers", users);
  });
});
