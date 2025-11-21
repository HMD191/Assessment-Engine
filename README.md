## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).


## TODO

- [x] API for submission implemented
  - [x] POST /submissions to create a submission
  - [x] GET /submissions/:id to get submission status/data
  - [x] PATCH /submissions/:id to update submission data

- [x] Add submission into queue
  - [x] enqueue submissions after validation
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
- [ ] Document all endpoints
  - [ ] request/response examples and status codes in README
  - [ ] update OpenAPI/Swagger docs
  - [ ] add usage examples for enqueueing submissions
- [ ] Add tests
  - [ ] unit tests for submission handler / validation
  - [ ] integration tests for enqueue -> worker flow (use test queue or in-memory)
  - [ ] e2e tests for API endpoints
  - [ ] enforce coverage thresholds in CI

Optional / follow-ups
- [ ] CI/CD: run lint, tests, and build on push; fail on coverage regression
- [ ] Observability: metrics (Prometheus), health-check endpoints, and error reporting (Sentry)
- [ ] Deployment: verify prod config (env vars, secrets) and document deployment steps

Acceptance criteria (for each task)
- Automated tests exist and pass
- Behavior covered in README and OpenAPI
- Logs reliably show job lifecycle and errors
- Queue/worker survive restarts and retry failing jobs according to policy
- Production deployment instructions verified