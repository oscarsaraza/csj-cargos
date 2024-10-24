'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { loginWithCode, logout, requestLoginCode } from '~/lib/auth'

const requestLoginSchema = z.object({
  username: z.string(),
  domain: z.string(),
})

export const requestLoginAction = async (prevState: unknown, formData: FormData) => {
  const { success, data, error } = requestLoginSchema.safeParse(Object.fromEntries(formData))
  if (!success) throw new Error(error.message)

  const username = data.username.toLowerCase().trim()

  const result = await requestLoginCode(username, data.domain)
  if (!result.success) throw new Error(result.message)

  console.log('Inicio de sesión:', username, data.domain)

  return { username, domain: data.domain }
}

const loginWithCodeSchema = z.object({
  username: z.string(),
  code: z.string(),
})

export const loginWithCodeAction = async (prevState: unknown, formData: FormData) => {
  const { success, data, error } = loginWithCodeSchema.safeParse(Object.fromEntries(formData))
  if (!success) throw new Error(error.message)

  const result = await loginWithCode(data.username, data.code)
  if (!result.success) throw new Error('Código de verificación incorrecto.')

  cookies().set(result.sessionCookie.name, result.sessionCookie.value, result.sessionCookie.attributes)

  return { success: true }
}

export const logoutUserAction = async () => {
  await logout()
  return { success: true }
}
