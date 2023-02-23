#### Project Implementation and Further Info

There are 3 modules to this project.

1. REST API node.js server - codebase is in `**_src/_**` directory.
2. TCP server - code for tcp server is in `**tcp/server.js**` file.
3. TCP client - code for tcp client is in `**tcp/client.js**` file.

### TCP Server (NodeJS + sockets) and TCP Client

It uses nodejs `net` package and creates a tcp protocol server that actively listens to clients, once they connected. TCP server also uses `Redis-PubSub` messaging channel to handle coordination between server instances,when deploy and run multiple instances, there will be load balancer running with roundrobin policy. Hence, Each instance will be able to coordinate with the others to satisfy the requests as if they are like a single entity.

- Code for TCP server is available in `/tcp` directory > `/tcp/server.js` file.
- Sample configuration for load balancing and roundrobin is also in `tcp/` directory. There are simple `Dockerfile`, `docker-compose.yml` and `haproxy.cfg` configurations already in for you.

You will also notice there is `client.js` file under `/tcp/` directory. I created this client example for testing and connecting client to our tcp server which get connected to our server and send messages, as defined in the scope requirement document.

### Steps to run the tcp server and http REST api server:

- TCP server + HTTP REST API server:

> **Please note:** TCP server requires `Redis` and our Node HTTP REST API server to be up and running.


it can be run through docker `docker-compose up` command.

```bash
$ docker-compose up
$ docker-compose down
$ docker-compose build
```

- TCP client:

```bash
$ cd tcp/
$ npm run client # or, > node client.js
```

##### HTTP Server - REST API (NestJS + NodeJS)

This project REST API server is created using Nest.js, MySQL, also the live swagger API client will also be available over `{server_address}:{server_port}/docs`. 

http://localhost:3000/docs


Once you run the node API server, you can also check the server status by visiting the server url.

http://localhost:3000


### Summary:

By default the servers will run on following ports, if you don't change anything and simply make it run.

- HTTP REST server: 3000
- TCP server on port: 4000

- Redis: 6379
- MySQL: 3306



##### TCP server + test client.

> **NOTE:** For TCP server please go the `README.md` doc in the project root directory. Now TCP server runs inside the main application container, where we have REST HTTP API server + TCP server runs together via `docker-compose` file

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


Kr, Narain