'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

  const [requestStateLogin, requestLogin] = useFormState(requestLoginAction, { username })
  const [loginWithCodeState, loginWithCode] = useFormState(loginWithCodeAction, { success: false })

  useEffect(() => {
    setLoginRequested(Boolean(requestStateLogin.username))
  }, [requestStateLogin])

  useEffect(() => {
    if (loginWithCodeState.success) router.push('/')
  }, [loginWithCodeState])

  const onRequestLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
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
    return <RequestLogin username={username} setUsername={setUsername} onSubmit={onRequestLoginSubmit} />
  return <LoginWithCode username={username} code={code} setCode={setCode} onSubmit={onLoginWithCodeSubmit} />
}

function RequestLogin({
  username,
  setUsername,
  onSubmit,
}: {
  username: string
  setUsername: (username: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
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
                  <span>@cendoj.ramajudicial.gov.co</span>
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
    </div>
  )
}

function LoginWithCode({
  username,
  code,
  setCode,
  onSubmit,
}: {
  username: string
  code: string
  setCode: (code: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
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
                  <Input type="text" value={`${username}@cendoj.ramajudicial.gov.co`} disabled />
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
    </div>
  )
}
