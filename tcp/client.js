const net = require("net");
const readline = require("readline");
const uuid = require("uuid");

const templates = {
  // message templates
  PATTERN_REPORT: `REPORT. I'M HERE (.+) (.+), (.+) AND CHARGED AT (.+)%.`,
  PATTERN_HELLO: `HELLO, I'M (.+)!`,
  PATTERN_HEY_YOU: `HEY YOU, (.+)!`,
  PATTERN_FINE: `FINE. I'M HERE (.+) (.+), (.+) AND CHARGED AT (.+)%.`,
  PATTERN_KEEP_ME_POSTED: `KEEP ME POSTED EVERY (.+) SECONDS.`,
  PATTERN_WTF: `WTF! (.+)\n(.+)`,

  // static messages
  LOGIN_REPLY: `HI, NICE TO MEET YOU!`,
  INTERVAL_REPLY: `I CAN'T, SORRY.`,
  STATUS_REQUEST: `HOW'S IT GOING?`,
  BLOB_REPLY: `DAAAMN! ISSUE REPORTED ON JIRA`,
  SESSION_END_REQUEST: `GOTTA GO.`,
  SESSION_END_REPLY: `SEE YA!`,

  DONE: `DONE!`,
  STATUS_REPLY: `SURE, I WILL!`,
  PING: "PING.",
  PONG: "PONG.",
  THANKS: "OK, THANKS!",
};

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

const TCP_PORT = +process.env.TCP_PORT || 4000;
const TCP_HOST = process.env.TCP_HOST || "localhost";

let serverIdentifier = "";

// Generate a UUID for the client
const clientIdentifier = uuid.v4();

const client = new net.Socket();

client.connect(TCP_PORT, TCP_HOST, () => {
  console.log(`Connected to server on port: ${TCP_PORT}`);

  // Schedule the "ping" message to be sent every 60 seconds
  let pingIntervalId = 0;
  let updateIntervalId = 0;
  let updateInterval = 0; // keep me posted interval

  rl.on("line", (input) => {
    // Send the message and clientId to the server
    let message = "";
    switch (input.toUpperCase()) {
      case "LOGIN": // t2
        // const id = process.env.CLIENT_IDENTIFIER
        message = `HELLO, I'M ${clientIdentifier ?? "UNKNOWN"}!`;
        break;

      case "ERROR":
        message = `WTF! 13\n72,101,108,108,111,44,32,119,111,114,108,100,33`;
        break;

      case "GOTTA GO.": // SESSION_END_REQUEST
        message = `GOTTA GO.`;
        break;

      case "REPORT":
        message =
          "REPORT. I'M HERE 45.021561650 8.156484, RESTING AND CHARGED AT 67%.";
        break;

      // just for testing (TODO: remove)
      case "PING.":
        message = `PING.`;
        break;

      default:
        console.log(`Invalid input command: ${input}`);
        return;
    }

    client.write(
      JSON.stringify({
        message,
        clientId: clientIdentifier,
        serverId: serverIdentifier,
      })
    );
  });

  client.on("data", (data) => {
    const { type, message, serverId } = JSON.parse(data);
    // "connected" with server having serverId
    if (type === "connected") {
      serverIdentifier = serverId;

      console.log("Connected with serverId: ", serverId);
      console.log(`---> Received data from Server: ${data.toString()}`);

      // 1. Identify vehicle.
      client.write(
        JSON.stringify({
          message: `HELLO, I'M ${clientIdentifier}!`,
          // message: "FINE. I'M HERE 45.021561650 8.156484, RESTING AND CHARGED AT 42%.",
          clientId: clientIdentifier,
          serverId: serverIdentifier,
        })
      );

      // PING interval 60 seconds
      pingIntervalId = setInterval(() => {
        client.write(
          JSON.stringify({
            type: "message",
            message: templates.PING,
            serverId: serverIdentifier,
            clientId: clientIdentifier,
          })
        );
      }, 60 * 1000); // 60 seconds
    } else {
      console.log(`---> Received message from server: ${message}`);
      let reply = "";
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
              client.write(
                JSON.stringify({
                  clientId: clientIdentifier,
                  serverId: serverIdentifier,
                  message: `REPORT. I'M HERE ${latitude} ${longitude}, ${status} AND CHARGED AT ${battery}%.`,
                })
              );
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
      } else if (message === templates.SESSION_END_REQUEST) {
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
        // console.info('INVALID MESSAGE:', message);
      }

      if (reply) {
        console.log("---> SENDING REPLY TO SERVER:", reply);
        client.write(
          JSON.stringify({
            serverId: serverIdentifier,
            clientId: clientIdentifier,
            message: reply,
          })
        );
      }

      if (message === templates.SESSION_END_REPLY) { // handle close
        client.destroy();
      }
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
