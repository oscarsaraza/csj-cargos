'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { logoutUserAction } from '../(public)/login/actions'

export function Header({ username }: { username: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [formState, logoutUser] = useFormState(logoutUserAction, { success: false })

  const isLinkActive = (href: string) => {
    return pathname === href
  }

  const onLogout = () => {
    logoutUser()
  }

  useEffect(() => {
    if (formState.success) router.push('/login')
  }, [formState])

  return (
    <header className="flex flex-row items-center justify-end gap-2 px-4 py-2">
      <Link href="/" className={cn('text-xl text-slate-900', { 'font-bold underline': isLinkActive('/') })}>
        Emparejamiento
      </Link>
      <Link
        href="/actos-administrativos"
        className={cn('text-xl text-slate-900', { 'font-bold underline': isLinkActive('/actos-administrativos') })}
      >
        Actos administrativos
      </Link>
      <Link
        href="/consolidado"
        className={cn('text-xl text-slate-900', { 'font-bold underline': isLinkActive('/consolidado') })}
      >
        Consolidado
      </Link>

      <div className="grow"></div>

      <span>{username}</span>
      <Button variant="link" onClick={onLogout}>
        Cerrar sesión
      </Button>
    </header>
  )
}
