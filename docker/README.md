
#### Running Docker

There is a `docker-compose.yml` file for starting MySQL + Redis via Docker.

- `docker-compose up`

After running the sample, you can stop the Docker container with

- `docker-compose down`

Alternatively you can also run them separately like below,

### MySQL

- `docker-compose -f db-compose.yml up`
- `docker-compose -f db-compose.yml down`

### Redis

- start: `docker-compose -f redis-compose.yml up`
- stop: `docker-compose -f redis-compose.yml down`