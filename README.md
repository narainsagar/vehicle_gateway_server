# Vehicle Server Gateway

> The project is created using [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.


> You may check [INFO.md](./INFO.md) file for more info about the implementation and approach and more.


> For **TCP Client** module you may check [./client/README.md](./client/README.md) file.


## Installation

```bash
$ npm install
```

> You might be need to provide your ENV variables in `.env` file (provide your configurations, if you want to.)

```bash
$ cp .env.sample .env
```

## Requirements / Prerequisites:

For this project to run, you need following services / tools to be installed on your system, up and running.

- Node.js & NPM
- Redis
- MySQL

> I have also added docker `docker-compose` files for you so you can quickly run them without installing on your actual machine. Checkout [**/docker**](./docker/) for it.


> **Important:** Please make sure once the _mysql is running.._ you need to create a database called `test_db` (please verify the name in your configuration or use `test_db` as the default one). This is required only for first time.

This is all you need. :)

Once everything is installed, up and running, you can proceed to the next steps.

## Running the `REST-API server` app:

> **Note:** To run the project locally, make sure the `redis` and `mysql` running on your machine (you can verify and validate the configuration in `.env` file)

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running the `TCP server` module:

```bash
$ npm run start:tcp

## Or, maybe run using `node`:
$ node tcp-server.js
```

> Alternatively, you can also run the project by building docker image and using `docker-compose`, check the next steps.

## Docker commands

> **NOTE:** The TCP server runs inside the this main application container, where we have REST HTTP API server + TCP server runs together via `docker-compose` file:

- `docker-compose up`
- `docker-compose down`
- `docker-compose build`

- restart via docker-compose: `docker-compose down && docker-compose build && docker-compose up`

- Build docker image: `docker build -f Dockerfile .`

## Errors? 

- Error: listen EADDRINUSE: address already in use ::1:3400 ?

```bash
$ lsof -i :3400 # check PID
$ kill PID
```

## Test

> **Note:** Currently, only the setup for automation tests is already configured.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Author(s)

- [@narainsagar](https://github.com/narainsagar)
