# TCP Client (for Testing)

```bash
$ npm install
```

## Running the app

> **Note:** To run the this script locally, make sure the `node` and `npm` is installed and running on your machine. You can also verify and validate the environment configuration in `.env.sample` file (incase, if you want different settings, you can add your `.env` file also).

```bash
# tcp client
$ npm run client

## OR, using `node`:
$ node client.js
```


##### Summary

> **NOTE:** For TCP server please go the `README.md` doc in the project root directory. TCP server module runs inside the main application container, where we have REST HTTP API server + TCP server combined together via `docker-compose` file.

Once you run the app, TCP server will start immediately and as you run/execute the tcp client, the clients gets connected to the running tcp servers (in sequencial way `roundrobin` - when run via `docker-compose up`).

Client will genenerate a UUID as `device_id` and send to the server, as soon as it gets connected.

then, `PING.`/ `PONG.` messages gets started (client will send PING every `60` seconds to send `heartbeat` updates).

You should also be able to send your messages from clients terminal windows (as if they will be running on your system).


Right now, we have some dummy hardcoded messages in the client for testing following messages, but you can modify it for various clients, if you want to.

```bash
> ERROR
> GOTTA GO.
```
