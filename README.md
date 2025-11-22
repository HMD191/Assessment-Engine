# Description

some description here

# Setup instructions (Run locally)

## Project setup
```bash
$ npm install
```

## Compile and run the project
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Run tests (Haven't been implemented yet)

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Deployment
//can instruct docker


# TODO

- [x] API for submission implemented
  - [x] POST /submissions to create a submission
  - [x] GET /submissions/:id to get submission status/data
  - [x] PATCH /submissions/:id to update submission data

- [x] Add submission into queue
  - [x] POST handler enqueues job
  - [x] GET handler checks job status
  - [x] ensure idempotency / deduplication
  - [x] implement retry/backoff and dead-letter handling
- [x] Implement worker
  - [x] pull jobs, process submissions, acknowledge/fail correctly
  - [x] support concurrency limits and graceful shutdown
  - [x] surface processing errors for retries / DLQ
- [x] Add structured logging
  - [x] use nestjs logger
  - [x] log job lifecycle events (enqueue, start, complete, fail)
  - [x] attach request IDs / correlation IDs to logs
- [x] Document all endpoints
  - [x] OpenAPI
  - [x] Swagger docs
- [ ] Add tests
  - [ ] unit tests for submission handler / validation
  - [ ] integration tests for enqueue -> worker flow (use test queue or in-memory)
  - [ ] e2e tests for API endpoints
  - [ ] enforce coverage thresholds in CI
- [x] Dockerize the application
  - [x] create Dockerfile for API + worker
  - [x] setup docker-compose for local development with dependencies (DB, queue)
  - [x] document how to run with Docker

# Architecture Overview
![Architecture picture](./assets/architecture_diagram.png)

# API Documentation
The API documentation is available at `/docs` endpoint when the server is running or at `openapi.yaml` file in the project root.

# Design decisions and trade-offs

## PostgreSQL database schema
tells about the tables and relationships used to store submission data.
### Pros
### Cons
How to improve it further.

## Queue System
### Pros
### Cons
How to improve it further.