'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useReducer, useState } from 'react'
import { useFormState } from 'react-dom'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp'
import { Label } from '~/components/ui/label'
import { loginWithCodeAction, requestLoginAction } from './actions'

export default function Page() {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [loginRequested, setLoginRequested] = useState(false)
  const router = useRouter()
  const [selectedDomain, toggleDomain] = useReducer(
    (value) => (value === '@cendoj.ramajudicial.gov.co' ? '@cndj.gov.co' : '@cendoj.ramajudicial.gov.co'),
    '@cendoj.ramajudicial.gov.co',
  )

  const [requestStateLogin, requestLogin] = useFormState(requestLoginAction, { username, domain: selectedDomain })
  const [loginWithCodeState, loginWithCode] = useFormState(loginWithCodeAction, { success: false })

  useEffect(() => {
    setLoginRequested(Boolean(requestStateLogin.username))
  }, [requestStateLogin])

  useEffect(() => {
    if (loginWithCodeState.success) router.push('/')
  }, [loginWithCodeState, router])

  const onRequestLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('domain', selectedDomain)
    requestLogin(formData)
  }

  const onLoginWithCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('code', code)
    loginWithCode(formData)
  }

  if (!loginRequested)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100">
        {requestStateLogin.success !== undefined && requestStateLogin.success === false ? (
          <div className="font-bold text-red-500">{requestStateLogin.message}</div>
        ) : null}
        <RequestLogin
          username={username}
          setUsername={setUsername}
          domain={selectedDomain}
          toggleDomain={toggleDomain}
          onSubmit={onRequestLoginSubmit}
        />
      </div>
    )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100">
      {loginWithCodeState.success !== undefined && loginWithCodeState.success === false ? (
        <div className="font-bold text-red-500">{loginWithCodeState.message}</div>
      ) : null}
      <LoginWithCode
        username={username}
        code={code}
        setCode={setCode}
        domain={selectedDomain}
        onSubmit={onLoginWithCodeSubmit}
      />
    </div>
  )
}

function RequestLogin({
  username,
  setUsername,
  onSubmit,
  domain,
  toggleDomain,
}: {
  username: string
  setUsername: (username: string) => void
  onSubmit: (e: React.FormEvent) => void
  domain: string
  toggleDomain: () => void
}) {
  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Inicio de sesión</CardTitle>
          <div className="text-center font-bold text-muted-foreground">Consolidación de cargos - UDAE</div>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="flex flex-row items-center gap-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Input name="domain" type="hidden" value={domain} />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      toggleDomain()
                    }}
                  >
                    {domain}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="max-w-md text-muted-foreground">
        Para el diligenciamiento de la encuesta de servidores judiciales, se requiere iniciar sesión{' '}
        <span className="text-red-500">con el correo asignado para cada despacho</span>. Puede verificar el correo
        electrónico registrado para cada despacho en el siguiente enlace.
      </p>
      <Link href="/directorio" target="_blank" rel="noopener noreferrer">
        <Button variant="link">Directorio de despachos</Button>
      </Link>
      <Link
        href="https://archivos.cargos.csbc.app/Gu%C3%ADa%20de%20diligenciamiento%20de%20encuesta%20a%20servidores%20judiciales%202024.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="link">Guía de diligenciamiento de la encuesta a servidores</Button>
      </Link>
    </>
  )
}

function LoginWithCode({
  username,
  code,
  setCode,
  onSubmit,
  domain,
}: {
  username: string
  code: string
  setCode: (code: string) => void
  onSubmit: (e: React.FormEvent) => void
  domain: string
}) {
  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Inicio de sesión</CardTitle>
          <div className="text-center font-bold text-muted-foreground">Consolidación de cargos - UDAE</div>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="flex flex-row items-center gap-2">
                  <Input type="text" value={`${username}${domain}`} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} id="code" value={code} onChange={(value) => setCode(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}
