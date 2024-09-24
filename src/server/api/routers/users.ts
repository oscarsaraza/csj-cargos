import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { loginWithCode, requestLoginCode } from '~/lib/auth'
import { TRPCError } from '@trpc/server'
import { cookies } from 'next/headers'

export const usersRouter = createTRPCRouter({
  requestLogin: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await requestLoginCode(input.username)

      if (!result.success) throw new TRPCError({ code: 'BAD_REQUEST', message: result.message })

      return { username: result.username }
    }),

  loginWithCode: publicProcedure
    .input(
      z.object({
        username: z.string(),
        code: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await loginWithCode(input.username, input.code)

      if (!result.success) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Código de verificación incorrecto.' })

      cookies().set(result.sessionCookie.name, result.sessionCookie.value, {
        // path: '.',
        ...result.sessionCookie.attributes,
      })

      return { success: true }
    }),
})
