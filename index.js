'use strict'
const fp = require('fastify-plugin')
const EventEmitter = require('node:events')

const pluginName = '@kit-p/fastify-tasks'

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {Promise<void>}
 */
async function fastifyTasks (fastify) {
  let closing = false

  const taskEvent = new EventEmitter()

  /**
   * @type {{ named: string[], unnamed: number }}
   */
  const tasks = {
    named: [],
    unnamed: 0
  }

  /**
   * @returns {boolean} - true if there is no any named or unnamed task
   */
  function isTasksEmpty () {
    return tasks.named.length + tasks.unnamed <= 0
  }

  /**
   * @param {string} [name] - Task name to add, does not need to be unique
   * @returns {void}
   */
  function addTask (name) {
    if (closing) {
      throw new Error('Server is closing. Tasks must be added before sending reply.')
    }

    if (typeof name === 'string') {
      tasks.named.push(name)
    } else {
      tasks.unnamed++
    }
  }

  /**
   * @param {string} [name] - Task name to remove
   * @returns {void}
   */
  function removeTask (name) {
    if (typeof name === 'string') {
      const taskIdx = tasks.named.indexOf(name)
      if (taskIdx < 0) {
        throw new Error(`Task with name "${name}" does not exist`)
      }
      tasks.named.splice(name, 1)
    } else if (tasks.unnamed <= 0) {
      throw new Error('There is no unamed task to delete')
    } else {
      tasks.unnamed--
    }

    taskEvent.emit('TaskRemoved', name)
  }

  fastify.decorate('tasks', {
    add: addTask,
    remove: removeTask
  })

  fastify.addHook('preClose', (done) => {
    closing = true

    if (isTasksEmpty()) {
      fastify.log.info(`[${pluginName}] all tasks have completed, server can be closed`)
      done()
      return
    }

    taskEvent.on('TaskRemoved', (name) => {
      if (isTasksEmpty()) {
        fastify.log.info(`[${pluginName}] all tasks have completed, server can be closed`)
        done()
        return
      }

      fastify.log.info(`[${pluginName}] waiting for all tasks to complete before closing the server, remaining ${tasks.named.length} named tasks and ${tasks.unnamed} unnamed tasks.`)
      if (typeof name === 'string' && tasks.named.length > 0) {
        fastify.log.debug(`[${pluginName}] remaining named tasks are ${JSON.stringify(tasks.named)}`)
      }
    })

    fastify.log.info(`[${pluginName}] waiting for all tasks to complete before closing the server, remaining ${tasks.named.length} named tasks and ${tasks.unnamed} unnamed tasks.`)
    fastify.log.debug(`[${pluginName}] remaining named tasks are ${JSON.stringify(tasks.named)}`)
  })
}

module.exports = fp(fastifyTasks, {
  fastify: '4.x',
  name: pluginName
})
module.exports.default = fastifyTasks
module.exports.fastifyTasks = fastifyTasks
