'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Button } from '~/components/ui/button'
import { logoutUserAction } from '../(public)/login/actions'

export function Header({ username }: { username: string }) {
  const router = useRouter()
  const [formState, logoutUser] = useFormState(logoutUserAction, { success: false })

  const onLogout = () => {
    logoutUser()
  }

  useEffect(() => {
    if (formState.success) router.push('/login')
  }, [formState])

  return (
    <header className="flex flex-row items-center justify-end gap-2 px-4 py-2">
      <span>{username}</span>
      <Button variant="link" onClick={onLogout}>
        Cerrar sesión
      </Button>
    </header>
  )
}
