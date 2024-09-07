'use strict'

const fastify = require('fastify')({ logger: { level: 'debug' } })

fastify.register(require('..'))

async function doWork () {
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

fastify.get('/work', async (req, reply) => {
  fastify.tasks.add(req.id)
  fastify.tasks.add()
  reply.send('acknowledged')
  await doWork()
  fastify.tasks.remove()
  await doWork()
  fastify.tasks.remove(req.id)
})

async function gracefulShutdown (signal) {
  fastify.log.info(`received signal ${signal}, closing the server`)
  try {
    await fastify.close()
    fastify.log.info('server closed')
    process.exit(0)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)

  console.log('sending first request to /work')
  fetch(`http://localhost:${fastify.server.address().port}/work`)

  setTimeout(() => {
    console.log('sending SIGTERM')
    process.kill(process.pid, 'SIGTERM')
  }, 500)

  setTimeout(() => {
    console.log('sending second request to /work')
    fetch(`http://localhost:${fastify.server.address().port}/work`)
  }, 1000)
})
