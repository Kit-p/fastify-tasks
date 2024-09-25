'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')

class Logger {
  silentBuffer = []
  traceBuffer = []
  debugBuffer = []
  infoBuffer = []
  warnBuffer = []
  errorBuffer = []
  fatalBuffer = []

  constructor (opts) {
    this.level = (opts || {}).level || 'info'
  }

  silent (...args) { this.silentBuffer.push(args.join(' ')) }
  trace (...args) { this.traceBuffer.push(args.join(' ')) }
  debug (...args) { this.debugBuffer.push(args.join(' ')) }
  info (...args) { this.infoBuffer.push(args.join(' ')) }
  warn (...args) { this.warnBuffer.push(args.join(' ')) }
  error (...args) { this.errorBuffer.push(args.join(' ')) }
  fatal (...args) { this.fatalBuffer.push(args.join(' ')) }

  child () { return this }
}

test('fastify.tasks exists', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'))

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.tasks)

    fastify.close()
  })
})

test('fastify.tasks.add exists', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'))

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.tasks.add)

    fastify.close()
  })
})

test('fastify.tasks.remove exists', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'))

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.tasks.remove)

    fastify.close()
  })
})

test('fastify.tasks.add and fastify.tasks.remove works with an unnamed task', t => {
  t.plan(4)
  const logger = new Logger()
  const fastify = Fastify({
    loggerInstance: logger,
    disableRequestLogging: true
  })

  fastify.register(require('../index'))

  fastify.get('/work', (req, reply) => {
    fastify.tasks.add()
    reply.send('')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/work'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      fastify.close(() => {
        t.ok(logger.infoBuffer.find(msg => /remaining.+1 unnamed tasks/.test(msg)))
      })
      setImmediate(() => {
        fastify.tasks.remove()
      })
    })
  })
})

test('fastify.tasks.add and fastify.tasks.remove works with a named task', t => {
  t.plan(5)
  const logger = new Logger()
  const fastify = Fastify({
    loggerInstance: logger,
    disableRequestLogging: true
  })

  fastify.register(require('../index'))

  fastify.get('/work', (req, reply) => {
    fastify.tasks.add('test')
    reply.send('')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/work'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      fastify.close(() => {
        t.ok(logger.infoBuffer.find(msg => /remaining.+1 named tasks/.test(msg)))
        t.ok(logger.debugBuffer.find(msg => /\["test"\]/.test(msg)))
      })
      setImmediate(() => {
        fastify.tasks.remove('test')
      })
    })
  })
})

test('plugin is registered with "@kit-p/fastify-tasks" name', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'))

  fastify.ready(err => {
    t.error(err)

    const kRegistedPlugins = Symbol.for('registered-plugin')
    const registeredPlugins = fastify[kRegistedPlugins]
    t.ok(registeredPlugins.find(name => name === '@kit-p/fastify-tasks'))

    fastify.close()
  })
})
