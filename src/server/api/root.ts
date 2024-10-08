import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { actosRouter } from './routers/actos'
import { cargosRouter } from './routers/cargos'
import { encuestaRouter } from './routers/encuesta'
import { enlaceActosRouter } from './routers/enlaceActos'
import { usersRouter } from './routers/users'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  actos: actosRouter,
  encuestas: encuestaRouter,
  enlaceActos: enlaceActosRouter,
  cargos: cargosRouter,
  users: usersRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
