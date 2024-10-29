'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { loginWithCode, logout, requestLoginCode } from '~/lib/auth'
import { db } from '~/server/db'

const requestLoginSchema = z.object({ username: z.string(), domain: z.string() })

export const requestLoginAction = async (prevState: unknown, formData: FormData) => {
  const { success, data } = requestLoginSchema.safeParse(Object.fromEntries(formData))
  if (!success) return { success: false, message: 'Datos de inicio de sesión no válidos.' }

  const username = data.username.toLowerCase().trim()

  const despacho = await db.despacho.findFirst({ where: { email: { startsWith: username } } })
  const user = await db.user.findFirst({ where: { username } })

  if ((!user || user.role === 'external') && !despacho)
    return {
      success: false,
      message:
        'El correo electrónico proporcionado no corresponde a un usuario autorizado o al correo electrónico de un despacho.',
    }

  const result = await requestLoginCode(username, data.domain)
  if (!result.success) return { success: false, message: result.message }

  console.log('Inicio de sesión:', username, data.domain)

  return { username, domain: data.domain }
}

const loginWithCodeSchema = z.object({ username: z.string(), code: z.string() })

export const loginWithCodeAction = async (prevState: unknown, formData: FormData) => {
  const { success, data } = loginWithCodeSchema.safeParse(Object.fromEntries(formData))
  if (!success) return { success: false, message: 'Datos de verificación inválidos' }

  const username = data.username.toLowerCase().trim()

  const result = await loginWithCode(username, data.code)
  if (!result.success) return { success: false, message: 'Código de verificación incorrecto' }

  cookies().set(result.sessionCookie.name, result.sessionCookie.value, result.sessionCookie.attributes)

  return { success: true }
}

export const logoutUserAction = async () => {
  await logout()
  return { success: true }
}
