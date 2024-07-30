const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const orderController = require("./controllers/orderController");
const dotenv = require("dotenv");
const router = require("./routes/routes");
const connectDB = require("./utils/db");
const cors = require("cors");
const job = require("./cron");
const { socketConnection } = require("./controllers/socketController");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith("/orders/webhook/stripe")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.use(cors({
  origin:"http://localhost:3000",
  methods:"GET,POST,PUT,DELETE",
  credentials:true
}));

// app.use(cors());


// Define your routes
app.use(router);
app.post("/orders/webhook/stripe", orderController.webhook);

connectDB();

job.start();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

socketConnection(io);
