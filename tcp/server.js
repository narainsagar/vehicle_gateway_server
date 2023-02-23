const net = require("net");
const Redis = require("ioredis");
const uuid = require("uuid");
const axios = require("axios");
const readline = require("readline");

const server = net.createServer();

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = +process.env.REDIS_PORT || 6379;

const TCP_PORT = +process.env.TCP_PORT || 4000;
const TCP_HOST = process.env.TCP_HOST || "localhost"; // 127.0.0.1

// Node REST API
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = +process.env.SERVER_PORT || 3000;

const SERVER_TCP_HANDLER_ENDPOINT_URL = `http://${SERVER_HOST}:${SERVER_PORT}/vehicles/tcpHandleMessage`;

const REDIS_PUBSUB_CHANNEL =
  process.env.REDIS_PUBSUB_CHANNEL || "VehicleServers";

const clientConnections = {}; // Map of client IDs to socket objects

// Generate a unique identifier for the client
const serverIdentifier = uuid.v4();

const redisClient = new Redis(REDIS_PORT, REDIS_HOST); // 192.168.1.1:6379

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function sendToClient(id, json) {
  const socket = clientConnections[id];
  if (id && socket) {
    socket.write(JSON.stringify({ ...json, serverId: serverIdentifier })); // { type: 'message', message: reply }
  }
}

function sendToAllClients(json) {
  Object.keys(clientConnections).forEach((id) => sendToClient(id, json));
}

async function handleMessage(message, clientId, socket) {
  let reply = "";
  try {
    axios
      .post(SERVER_TCP_HANDLER_ENDPOINT_URL, {
        message: message,
        clientId: clientId,
      })
      .then((response) => {
        console.log("----> Response from API:", response.data);
        if (response.data && response.data.success) {
          reply = response.data.message;
          if (reply && reply !== "MESSAGE RECEIVED") {
            // TODO: don't send. Confirm???
            socket.write(JSON.stringify({ type: "message", message: reply }));
          }
        }
      })
      .catch((error) => {
        console.log("error in api call:", error);
      });
  } catch (err) {
    console.log("some error:", err);
  }
}

const forwarder = new Redis(REDIS_PORT, REDIS_HOST);

// Send messages to the client when Redis publishes to the channel
const subscriber = redisClient.duplicate();
subscriber.subscribe(REDIS_PUBSUB_CHANNEL);

subscriber.on("message", async function (ch, jsonString) {
  const { message, clientId, serverId } = JSON.parse(jsonString);
  console.log("Received message via redis channel", jsonString);
  const connection = clientConnections[clientId];
  if (serverIdentifier === serverId && connection) {
    console.log(
      `----> Server ${serverId} responding to the client ${clientId}`
    );
    await handleMessage(message, clientId, connection); // call message handler
  }
});

console.info(">>> APP_ID:", process.env.APP_ID);

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

  // Subscribe the server to the Redis channel
  redisClient.subscribe(REDIS_PUBSUB_CHANNEL, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Server ${serverIdentifier} subscribed to channel`);
  });

  // Listen for messages from the Client
  socket.on("data", async (data) => {
    console.log(`Received data from Client: ${data}`);
    try {
      const { message, clientId, serverId } = JSON.parse(data.toString());

      // Add the socket to the connections map, if not exist.
      if (clientId && !clientConnections[clientId]) {
        clientConnections[clientId] = socket;
        socket.clientId = clientId;
      }

      /*
      // TODO: This can be removed (as Redis PUBSUB subscriber now does this work).
      if (serverIdentifier === serverId) {
        await handleMessage(message, clientId, socket); // call message handler
      } else {
        // Forward the message to a servers (subscribed and listening to redis channel)
        forwarder.publish(REDIS_PUBSUB_CHANNEL, data.toString());
      }
      */

      // Forward the message to all servers (subscribed and listening to redis channel)
      forwarder.publish(REDIS_PUBSUB_CHANNEL, data.toString());
    } catch (err) {
      console.log("some error:", err);
    }
  });

  socket.on("end", () => {
    // Unsubscribe the client from the Redis channel
    redisClient.unsubscribe(REDIS_PUBSUB_CHANNEL);
    subscriber.unsubscribe(REDIS_PUBSUB_CHANNEL);
    forwarder.quit();
    delete clientConnections[socket.clientId];
    console.log(
      "--> Client disconnected:",
      socket.remoteAddress,
      socket.remotePort
    );
  });
});

server.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});

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
