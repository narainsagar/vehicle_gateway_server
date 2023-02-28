const net = require("net");
const readline = require("readline");
const uuid = require("uuid");

// Global Variables
const templates = require('./messages-templates.enum');
const TCP_PORT = +process.env.TCP_PORT || 4000;
const TCP_HOST = process.env.TCP_HOST || "localhost";

let serverIdentifier = "";

// Generate a UUID for the client
const clientIdentifier = uuid.v4();

const client = new net.Socket();


function extractVariables(template, str) {
  const data = new RegExp(template).exec(str);
  return (data || []).map((s) => s.toString());
}

function handleCommand(cmd) {
  let replyMessage = "";
  switch (cmd) {
    case "RUN":
      // TODO: ?
      const success1 = true;
      replyMessage = success1 ? "DONE!" : `I CAN'T, SORRY.`;
      break;
    case "REST":
      // TODO: ?
      const success2 = false;
      replyMessage = success2 ? "DONE!" : `I CAN'T, SORRY.`;
      break;
    case "GOTTA GO.":
      // TODO: ?
      replyMessage = "SEE YA!";
      break;
  }

  return replyMessage;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

client.connect(TCP_PORT, TCP_HOST, () => {
  console.log(">>>>>>>>> CLIENT ID: ", clientIdentifier);
  console.log(`---> Client Connected to server on port: ${TCP_PORT}`);

  // Schedule the "ping" message to be sent every 60 seconds
  let pingIntervalId = 0;
  let updateIntervalId = 0;
  let updateInterval = 0; // keep me posted interval

  function writeDataToServer(dataJson) {
    /* --> dataJson format: 
      {
        type: "message",
        message: templates.PING,
        serverId: serverIdentifier,
        clientId: clientIdentifier,
      } 
    */
    console.log(`>>> Client sending data to server:`, dataJson);
    client.write(JSON.stringify(dataJson));
  }

  // TODO: check ~ cleanup required!!!
  rl.on("line", (input) => {
    // Send the message and clientId to the server
    let message = "";
    switch (input.toUpperCase()) {
      case "ERROR":
        message = `WTF! 13\n72,101,108,108,111,44,32,119,111,114,108,100,33`;
        break;

      case "GOTTA GO.": // SESSION_END_REQUEST
        message = `GOTTA GO.`;
        break;

      // case "REPORT":
      //   message =
      //     "REPORT. I'M HERE 45.021561650 8.156484, RESTING AND CHARGED AT 67%.";
      //   break;

      default:
        console.log(`Invalid input command: ${input}`);
        return;
    }

    writeDataToServer({
      type: 'message',
      message: message,
      clientId: clientIdentifier,
      serverId: serverIdentifier, // TODO: remove??
    });
  });

  // Receive data from Server
  client.on("data", (data) => {
    const { type, message, serverId } = JSON.parse(data);
    let reply = "";
    // "connected" with server having serverId
    if (type === "connected") {
      // Received connection success!
      serverIdentifier = serverId;

      console.log("---> Connected with serverId: ", serverId);
      console.log(`---> Received data from Server: ${data.toString()}`);

      // 1. Send Identification message.
      writeDataToServer({
        type: 'message',
        message: `HELLO, I'M ${clientIdentifier}!`,
        // message: "FINE. I'M HERE 45.021561650 8.156484, RESTING AND CHARGED AT 42%.",
        clientId: clientIdentifier,
        serverId: serverIdentifier, // TODO: remove??
      });

      // Send PING interval updates every 60 seconds
      pingIntervalId = setInterval(() => {
        writeDataToServer({
          type: "message", // TODO: change to 'updates'??
          message: templates.PING,
          serverId: serverIdentifier, // TODO: remove??
          clientId: clientIdentifier,
        });
      }, 60 * 1000); // 60 seconds
    } else if (type === "command") {
      // Received command from server
      console.log(`---> Received command from server: ${message}`);
      // let reply = "";
      if (message.startsWith("KEEP ME POSTED EVERY ")) {
        // Extract the current update interval from the status message
        const match = extractVariables(
          templates.PATTERN_KEEP_ME_POSTED,
          message
        );
        const [msg, seconds] = match;
        if (match && msg === message) {
          reply = templates.STATUS_REPLY;
          updateInterval = Number(seconds);
          if (updateInterval === 0) {
            clearInterval(updateIntervalId); // clear if 0
          } else {
            if (updateIntervalId) {
              clearInterval(updateIntervalId);
            }
            updateIntervalId = setInterval(() => {
              // sending Periodic Updates To Server
              const [latitude, longitude, status, battery] = [
                "43.021561650",
                "8.156484",
                "RUNNING",
                "47",
              ];
              writeDataToServer({
                type: 'message', // TODO: change to 'updates'??
                message: `REPORT. I'M HERE ${latitude} ${longitude}, ${status} AND CHARGED AT ${battery}%.`,
                clientId: clientIdentifier,
                serverId: serverIdentifier, // TODO: remove??
              });
            }, updateInterval * 1000);
          }
        }
      } else if (message.startsWith("HEY YOU, ")) {
        const match = extractVariables(templates.PATTERN_HEY_YOU, message);
        const [msg, cmd] = match;
        if (match && msg === message) {
          // TODO: handle command -> (Where RUN turns the vehicle on and REST turns it off.)
          reply = handleCommand(cmd); // {{“RUN”|”REST”}}
        }
      } else if (message === templates.SESSION_END_REQUEST) { // SEE YA!
        // TODO: handle command and close connection
        reply = templates.SESSION_END_REPLY;
      } else if (message === templates.STATUS_REQUEST) {
        // TODO: get vehicle details
        const [latitude, longitude, status, battery] = [
          "45.021561650",
          "8.156484",
          "RESTING",
          "65",
        ];
        reply = `FINE. I'M HERE ${latitude} ${longitude}, ${status} AND CHARGED AT ${battery}%.`;
      } else {
        console.log('---> Invalid command:', message);
      }
    } else if (type === "message") {
      // Received acknowledge messages from server
      // FYI: DO NOT REPLY!!!

      // PONG.
      // HI, NICE TO MEET YOU!
      // OK, THANKS!
      // SEE YA!

      console.info(`** Received acknowledge message from Server: `, data.toString());
    }

    // Only respond to type `command` and `updates` messages.
    if (reply /*&& type === 'command'*/) {
      console.log("---> SENDING REPLY TO SERVER:", reply);
      writeDataToServer({
        type: 'reply',
        message: reply,
        serverId: serverIdentifier, // TODO: remove??
        clientId: clientIdentifier,
      });
    }

    // Disconnect client when server wants to end session.
    if (message === templates.SESSION_END_REQUEST) {
      client.destroy(); // handle close
    }
  });

  client.on("close", () => {
    console.log("Connection closed");
    rl.close();
    if (pingIntervalId) {
      clearInterval(pingIntervalId);
    }
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
});
