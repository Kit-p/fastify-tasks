import { FastifyPluginAsync } from 'fastify';

declare module "fastify" {
  interface FastifyInstance {
    tasks: {
      add(name?: string): void;
      remove(name?: string): void;
    }
  }
}

type FastifyTasks = FastifyPluginAsync<fastifyTasks.FastifyTasksOptions>

declare namespace fastifyTasks {
  export interface FastifyTasksOptions {}

  export const fastifyTasks: FastifyTasks
  export { fastifyTasks as default }
}

declare function fastifyTasks(...params: Parameters<FastifyTasks>): ReturnType<FastifyTasks>
export = fastifyTasks
