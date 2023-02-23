# TCP Server + Testing Client

```bash
$ npm install
```

## Requirements / Prerequisites:

For this project to run, you need following services to be up and running on your system.

- Node.js + NPM
- Redis

- Our HTTP REST API (backend server)

> I have also added docker `docker-compose` files for you so you can quickly run them without installing on your actual machine. Feel free to check them out.

Once everything is installed, up and running, you can proceed to the next steps.

## Running the app

> **Note:** To run the project locally, make sure the `redis` and `mysql` running on your machine (you can verify and validate the configuration in `.env` file)

```bash
# tcp server
$ npm run start

# tcp client
$ npm run client


Alternatively, you can also run the project by building docker image and using `docker-compose`, check the next steps.

## Docker commands

- `docker-compose down`
- `docker-compose build`
- `docker-compose up`

- restart via docker-compose: `docker-compose down && docker-compose build && docker-compose up`

- Build docker image: `docker build -f Dockerfile .`


##### TCP server + client (testing).

Once you run the tcp server, It will start immediately and as you run the clients, they gets connected to the running servers (in sequencial way `roundrobin` - if running via `docker-compose`).

Client will genenerate a UUID as device_id and send to server, as soon as it gets connected.

then, `PING.`/ `PONG.` messages gets started (client will send PING every 60 seconds to send `heartbeat` updates).

You should also be able to send your messages from both client and server terminals (as if they will be running on your system).

Message formats for both client and server are as below:


- TCP server:

We have 2 message formats for tcp server. Firstly, if you want to send a message as command to specific clientId, using this format.

```bash
> {message}:{clientId}
```

Above will send message only to that client with clientId (if it will be connected).

> the `:` separator can be used to join `message` and `clientId`.

Also, if you like to send / broadcast a message to all connected clients / vehicles, you can simply type a message and hit enter (without `:` separator).

Here are some sample messages with `{clientId}` (add yours).

```bash
> HOW'S IT GOING?
> HEY YOU, RUN!:{clientId}
> HEY YOU, REST!:{clientId}
> GOTTA GO.
> KEEP ME POSTED EVERY 120 SECONDS.:{clientId}
> HOW'S IT GOING?:{clientId}
```

- TCP client:

Right now, we have some dummy hardcoded messages in the client for testing, but you can modify it for various clients, if you want to.

```bash
> LOGIN
> ERROR
> GOTTA GO.
> REPORT
```
