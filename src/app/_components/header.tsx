'use client'

import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { logoutUserAction } from '../(public)/login/actions'

export function Header({ username }: { username: string }) {
  const router = useRouter()

  const onLogout = () => {
    logoutUserAction()
    router.push('/login')
  }

  return (
    <header className="flex flex-row items-center justify-end gap-2 px-4 py-2">
      <span>{username}</span>
      <Button variant="link" onClick={onLogout}>
        Cerrar sesión
      </Button>
    </header>
  )
}
