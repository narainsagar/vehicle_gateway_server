const net = require("net");
const Redis = require("ioredis");
const uuid = require("uuid");
const axios = require("axios");
const readline = require("readline");

/**
 * Global Variables
 */

// TCP server Config
const TCP_PORT = +process.env.TCP_PORT || 4000;
// const TCP_HOST = process.env.TCP_HOST || "localhost"; // 127.0.0.1

// Node REST API server config
const REST_API_SERVER_HOST = process.env.REST_API_SERVER_HOST || "localhost";
const REST_API_SERVER_PORT = +process.env.REST_API_SERVER_PORT || 3000;
const SERVER_TCP_HANDLER_ENDPOINT_URL = `http://${REST_API_SERVER_HOST}:${REST_API_SERVER_PORT}/vehicles/tcpHandleMessage`;

// Redis Config
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = +process.env.REDIS_PORT || 6379;
const REDIS_PUBSUB_CHANNEL =
  process.env.REDIS_PUBSUB_CHANNEL || "VehicleServers";

const clientSockets = {}; // Map of client IDs to socket objects
const server = net.createServer();
// Generate a unique identifier for the client
const serverIdentifier = uuid.v4();

// Redis Publisher
const redisPublisher = new Redis(REDIS_PORT, REDIS_HOST);
// Send messages to the client when `redisPublisher` publishes to the channel
const redisSubscriber = new Redis(REDIS_PORT, REDIS_HOST);

redisPublisher.on("error", function (err) {
  console.log("Redis Publisher Got Error:", err);
});

redisSubscriber.on("error", function (err) {
  console.log("Redis Subscriber Got Error:", err);
});

// Subscribe the server to the Redis channel
redisSubscriber.subscribe(REDIS_PUBSUB_CHANNEL, async (err, count) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(
    `Server "${serverIdentifier}" subscribed to Redis channel "${REDIS_PUBSUB_CHANNEL}"`
  );

  // Checking HTTP REST API server status
  await axios
    .get(`http://${REST_API_SERVER_HOST}:${REST_API_SERVER_PORT}`)
    .then(function (response) {
      console.log(">>> HTTP server status:", response.data.toString());
    })
    .catch((error) => {
      console.log("error in GET api call:", error);
    });
});

// when redisSubscriber receive messages on Redis channel
redisSubscriber.on("message", async function (channel, jsonString) {
  console.log(`Received message from redis channel "${channel}":`, jsonString);

  const { type, message, clientId, serverId } = JSON.parse(jsonString);
  const clientSocket = clientSockets[clientId];

  // checking if client is connected...
  if (clientSocket) {
    if (type === "command") {
      // message received from HTTP REST API server
      // `serverId` is possibly undefined!
      console.log(
        `----> Server "${serverIdentifier}" responding to the client "${clientId}"`
      );
      // send command to connected vehicle
      clientSocket.write(
        JSON.stringify({
          type: type,
          message: message,
          serverId: serverIdentifier,
        })
      );
    } else if (type === "message") {
      // making sure correct server responds to client.
      // message received from TCP server publisher.
      if (serverIdentifier === serverId) {
        try {
          const reply = await fetchApiServerResponseForClientMessage(
            message,
            clientId
          ); // call message handler
          console.log(
            `----> Server "${serverId}" responding to the client "${clientId}" =>`,
            reply
          );
          // TODO: ignore the `updates` messages received from client and do not reply.
          if (reply) { // reply !== "MESSAGE RECEIVED"
            // TODO: Confirm?
            clientSocket.write(JSON.stringify({ type: "reply", message: reply }));
          }
        } catch (err) {
          console.info(
            "*some error while sending message to API server...",
            err
          );
        }
      } else {
        console.info(`*server is different ${serverId}`);
      }
    } else {
      console.info(`*Some other type "${type}"`, jsonString);
    }
  } /*else {
    console.info(`Server "${serverIdentifier}" did not find the client "${clientId}"`)
  }*/
});

console.info(">>> SERVER_ID:", process.env.SERVER_ID);
console.log(`Redis server is running on => ${REDIS_HOST}:${REDIS_PORT}`);

server.on("connection", (socket) => {
  console.log("Client connected ...", socket.remoteAddress, socket.remotePort);

  // Send a "ready" message to the client to indicate that it's connected
  socket.write(
    JSON.stringify({
      type: "connected",
      message: "Connected to server",
      serverId: serverIdentifier,
    })
  );

  // Listen for messages from the Client
  socket.on("data", async (data) => {
    console.log(`Received data from Client: ${data}`);
    try {
      const { type, clientId } = JSON.parse(data.toString());

      // Add the socket to the connections map, if not exist.
      if (clientId && !clientSockets[clientId]) {
        clientSockets[clientId] = socket;
        socket.clientId = clientId;
      }

      // Ignore the messages for type `reply` received from client.
      if (type === "message") {
        // Forward the message to all servers (subscribed and listening to redis channel)
        redisPublisher.publish(REDIS_PUBSUB_CHANNEL, data.toString());
      }
    } catch (err) {
      console.log("some error:", err);
    }
  });

  socket.on("end", () => {
    delete clientSockets[socket.clientId];

    console.log(
      "--> Client disconnected:",
      socket.remoteAddress,
      socket.remotePort
    );
  });
});

server.on("close", () => {
  // Unsubscribe the server from the Redis channel
  redisSubscriber.unsubscribe(REDIS_PUBSUB_CHANNEL);
  redisSubscriber.quit();
  redisPublisher.quit();
  console.log(`Server "${serverIdentifier}" is Closed.`);
});

server.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});

// Read Input from Terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// TODO: remove this??
rl.on("line", (input) => {
  // socket.write(JSON.stringify({type: "message", message: input }));
  const [message, id] = input.toString().split(":"); // format: "{message}:{clientUUID}"
  if (message) {
    if (id) {
      // send to specific client
      sendToClient(id.trim(), { type: "message", message: message.trim() });
    } else {
      // send to all clients.
      sendToAllClients({ type: "message", message: message.trim() });
    }
  }
});

// Global functions
function sendToClient(id, json) {
  const socket = clientSockets[id];
  if (id && socket) {
    socket.write(JSON.stringify({ ...json, serverId: serverIdentifier }));
  }
}

function sendToAllClients(json) {
  Object.keys(clientSockets).forEach((id) => sendToClient(id, json));
}

async function fetchApiServerResponseForClientMessage(message, clientId) {
  let reply = "";
  try {
    return axios
      .post(SERVER_TCP_HANDLER_ENDPOINT_URL, {
        type: "message",
        message: message,
        clientId: clientId,
      })
      .then((response) => {
        console.log("----> Response from API:", response.data);
        if (response.data && response.data.success) {
          reply = response.data.message;
          return reply;
        }
      })
      .catch((error) => {
        console.log("error in api call:", error);
        return error;
      });
  } catch (err) {
    console.log("some error:", err);
    return err;
  }
}
