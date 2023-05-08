import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import { Server as socketServer } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import http from "http";

class Server {
  constructor() {
    this.app = express();
    dotenv.config();
    this.plugins();
    this.routes();
    this.server = http.createServer(this.app);
    this.io = new socketServer(this.server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });
    this.webSocket();
  }

  // server configuration
  private app: Application;
  private server: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >;
  private io;

  private defaultRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // plugins
  protected plugins() {
    this.app.use(cors<Request>({ origin: "*", credentials: true }));
    this.app.use(cookieParser());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(this.defaultRateLimit);
  }

  //   routing
  protected routes() {
    this.app.get("/", (request: Request, response: Response) => {
      response.status(200).send("Api is ready to use");
    });
  }

  protected webSocket() {
    this.io.on("connection", (socket) => {
      // send a message to the client
      socket.emit("userID", socket.id);
      // socket.join(socket.id);

      // receive a message from the client
      socket.on("chat", async (message, roomID, name) => {
        socket.data.username = name;
        socket.join(roomID);
        let roomUsers = await this.io.in(roomID).fetchSockets();
        for (const socket of roomUsers) {
          console.log(socket.id);
          // console.log(socket.handshake);
          console.log(socket.rooms);
          console.log(socket.data.username);
        }

        socket.broadcast
          .to(roomID)
          .emit("messages", `message from ${name} : ${message}`);
      });

      // chat specific user
      socket.on("pm", (from, userID, message) => {
        socket
          .to(userID)
          .emit("private-message", `message from ${from} : ${message}`);
      });
    });
  }

  public start() {
    const PORT = process.env.PORT || 5000;
    this.server.listen(PORT, () =>
      console.log(`server running on port ${PORT}`)
    );
  }
}

const server = new Server();
server.start();
