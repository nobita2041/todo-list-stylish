
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createTaskInputSchema, 
  updateTaskCompletionInputSchema, 
  deleteTaskInputSchema 
} from './schema';
import { createTask } from './handlers/create_task';
import { getTasks } from './handlers/get_tasks';
import { updateTaskCompletion } from './handlers/update_task_completion';
import { deleteTask } from './handlers/delete_task';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  createTask: publicProcedure
    .input(createTaskInputSchema)
    .mutation(({ input }) => createTask(input)),
  getTasks: publicProcedure
    .query(() => getTasks()),
  updateTaskCompletion: publicProcedure
    .input(updateTaskCompletionInputSchema)
    .mutation(({ input }) => updateTaskCompletion(input)),
  deleteTask: publicProcedure
    .input(deleteTaskInputSchema)
    .mutation(({ input }) => deleteTask(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
