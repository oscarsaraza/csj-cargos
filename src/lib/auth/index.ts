import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { hash, verify } from '@node-rs/argon2'
import dayjs from 'dayjs'
import { type Cookie, Lucia } from 'lucia'
import { cookies } from 'next/headers'
import { db } from '~/server/db'
import { sendEmail } from '../email'

const adapter = new PrismaAdapter(db.session, db.user)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getSessionAttributes: (databaseSessionAttributes) => {
    return {
      username: databaseSessionAttributes.username,
    }
  },
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseSessionAttributes: DatabaseSessionAttributes
  }
}

interface DatabaseSessionAttributes {
  username: string
}

const passwordHashOptions = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

export const requestLoginCode = async (
  username: string,
  domain: string,
): Promise<{ success: true; username: string; domain: string } | { success: false; message: string }> => {
  if (typeof username !== 'string' || username.length < 3 || username.length > 45 || !/^[a-z0-9]+$/.test(username))
    return { success: false, message: 'Nombre de usuario no válido' }

  const password = Math.floor(100000 + Math.random() * 900000).toString()
  const passwordHash = await hash(password, passwordHashOptions)

  const to = `${username}${domain}`
  const html = `
<h1>Inicio de sesión</h1>
<p>Consolidación de cargos - UDAE</p>
<p>Seccional Boyacá y Casanare</p>
<hr/>
<p>Usuario: ${username}${domain}</p>
<p>Código: ${password}</p>`
  const sentEmailId = await sendEmail({ subject: 'Inicio de sesión', to, html })
  if (!sentEmailId)
    return {
      success: false,
      message: 'Error al enviar correo electrónico con el código de acceso. Intente nuevamente en unos instantes.',
    }

  const user = await db.user.findFirst({ where: { username } })
  const passwordExpiresAt = dayjs().add(10, 'minutes').toDate()

  const despacho = await db.despacho.findFirst({ where: { email: to } })

  if (!user)
    await db.user.create({
      data: {
        username,
        password: passwordHash,
        passwordExpiresAt,
        role: despacho ? 'office' : 'external',
      },
    })
  else await db.user.update({ where: { id: user.id }, data: { password: passwordHash, passwordExpiresAt } })

  return { success: true, username, domain }
}

export const loginWithCode = async (
  username: string,
  code: string,
): Promise<{ success: true; sessionCookie: Cookie } | { success: false; message: string }> => {
  if (!code || !username) return { success: false, message: 'Código de verificación incorrecto.' }

  const user = await db.user.findFirst({ where: { username: username.toString() } })
  if (!user) return { success: false, message: 'Código de verificación incorrecto.' }

  if (dayjs().isAfter(user.passwordExpiresAt)) return { success: false, message: 'Código de verificación incorrecto.' }

  const isValidPassword = await verify(user.password, code.toString(), passwordHashOptions)
  if (!isValidPassword) return { success: false, message: 'Código de verificación incorrecto.' }

  const session = await lucia.createSession(user.id, { username: user.username })
  const sessionCookie = lucia.createSessionCookie(session.id)

  return { success: true, sessionCookie }
}

export const logout = async () => {
  const authCookie = lucia.createBlankSessionCookie()
  cookies().set(authCookie.name, authCookie.value, authCookie.attributes)
}

export const validateSession = async () => {
  try {
    let authCookie = cookies().get(lucia.sessionCookieName)
    if (!authCookie) return { success: false, message: 'Sesión no válida.' }

    const { name, value } = authCookie
    const sessionId = lucia.readSessionCookie(`${name}=${value}`)
    if (!sessionId) return { success: false, message: 'Sesión no válida.' }

    const { user, session } = await lucia.validateSession(sessionId)

    if (session?.fresh) {
      authCookie = lucia.createSessionCookie(sessionId)
    } else if (!session) {
      authCookie = lucia.createBlankSessionCookie()
    }

    return { success: true, authCookie, user, session }
  } catch (error) {
    return { success: false, message: 'Sesión no válida.' }
  }
}
