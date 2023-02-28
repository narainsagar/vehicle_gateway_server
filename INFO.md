#### Project Implementation and Further Info

There are 3 modules to this project.

1. REST API HTTP node.js server - codebase is in `**_/src/_**` directory.
2. TCP server - code for tcp server is in `**/tcp-server.js**` file.
3. TCP client - code for tcp client is in `**/client/client.js**` file.

### TCP Server (NodeJS + sockets)

It uses nodejs `net` package and creates a tcp protocol server that actively listens to clients, once they connected. TCP server also uses `Redis-PubSub` messaging channel to handle coordination between server instances,when deploy and run multiple instances, there will be load balancer running with roundrobin policy. Hence, Each instance will be able to coordinate with the others to satisfy the requests as if they are like a single entity.

- Code for TCP server is available in `/tcp-server.js` file.
- Sample configuration for load balancing and roundrobin policy is configured in `docker-compose.yml` file. There are simple `Dockerfile`, `docker-compose.yml` and `haproxy.cfg` configurations already there.

You will also notice there is `client.js` file under `/client/` directory. I created this client example for testing and connecting client to our tcp server which connects to our tcp-server and send messages, as defined in the scope requirement document.

### Steps to run the tcp server and http REST api server:

- TCP server + HTTP REST API server:

> **Please note:** TCP server requires `Redis` and our Node HTTP REST API server to be up and running.


It can be run through docker `docker-compose up` command.

```bash
$ docker-compose up
$ docker-compose down
$ docker-compose build
```

Once the REST-API server and TCP server is up and running via `$ docker-compose up`. then you may connect client.

- TCP client:

```bash
$ cd client/
$ npm run client # OR, > node client.js
```

##### HTTP REST API Server (NestJS + NodeJS)

This project REST API server is created using Nest.js, TypeORM (MySQL), also the live swagger API docs will also be available over `{server_address}:{server_port}/docs`. 

http://localhost:3000/docs


Once you run the node API server, you can also check the server health/status by visiting the server url.

http://localhost:3000


### Summary:

By default the servers will run on following ports, if you don't change anything and simply run it.

- HTTP REST server: `3000`
- TCP server on port: `4000`

- Redis: `6379`
- MySQL: `3306`



##### TCP Client

> **NOTE:** For TCP server please go the `README.md` doc in the project root directory. TCP server module runs aside the main application container, where we have REST HTTP API server + TCP server combined together inside `docker-compose` file.

Once you run the app, TCP server will start immediately and as you run/execute the tcp client, the clients gets connected to the running tcp servers (in sequencial way `roundrobin` - when run via `docker-compose up`).

Client will genenerate a UUID as `device_id` and send to the server, as soon as it gets connected.

then, `PING.`/ `PONG.` messages gets started (client will send PING every `60` seconds to send `heartbeat` updates).

You should also be able to send your messages from clients terminal windows (as if they will be running on your system).


Right now, we have some dummy hardcoded messages in the client for testing following messages, but you can modify it for various clients, if you want to.

```bash
> ERROR
> GOTTA GO.
```

Kr, Narain