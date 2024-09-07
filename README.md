# @kit-p/fastify-tasks

![CI](https://github.com/Kit-p/fastify-tasks/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/@kit-p/fastify-tasks.svg?style=flat)](https://www.npmjs.com/package/@kit-p/fastify-tasks)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

Add task tracking support for Fastify. The server will not close until all tasks are completed.

`@kit-p/fastify-tasks` decorates the server interface with the `tasks.add` and `tasks.remove` methods for tracking tasks.

## Install

```
npm i @kit-p/fastify-tasks
```

<a name="quickstart"></a>

## Quick start

`fastify.register` is used to register @kit-p/fastify-tasks. By default, It will decorate the `fastify` object with `tasks.add` and `tasks.remove` methods that take an optional argument:

- the name of the task (does not need to be unqiue)

```js
// index.js:
const fastify = require("fastify")()
const fastifyTasks = require("@kit-p/fastify-tasks")

fastify.register(fastifyTasks)

// named task:
fastify.get("/", (req, reply) => {
  fastify.tasks.add('some-task')
  reply.send('')
  // do some work
  fastify.tasks.remove('some-task')
})

// unnamed task:
fastify.get("/", (req, reply) => {
  fastify.tasks.add()
  reply.send('')
  // do some work
  fastify.tasks.remove()
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
})
```