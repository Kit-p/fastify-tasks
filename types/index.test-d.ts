import fastify from "fastify";
import fastifyTasks, { FastifyTasksOptions } from "..";
import { expectAssignable, expectType } from "tsd";

const app = fastify();

app.register(fastifyTasks, {});

expectType<void>(app.tasks.add())
expectType<void>(app.tasks.add('test'))
expectType<void>(app.tasks.remove())
expectType<void>(app.tasks.remove('test'))

expectAssignable<FastifyTasksOptions>({})
