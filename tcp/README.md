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
```