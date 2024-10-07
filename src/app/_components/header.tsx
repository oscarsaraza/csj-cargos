'use client'

import { UserRole } from '@prisma/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { logoutUserAction } from '../(public)/login/actions'

const links = [
  { href: '/', label: 'Emparejamiento', roles: ['csj', 'deaj'] },
  { href: '/actos-administrativos', label: 'Actos administrativos', roles: ['csj', 'deaj'] },
  { href: '/enlace-actos', label: 'Revisión actos/cargos', roles: ['csj', 'deaj'] },
  { href: '/consolidado', label: 'Consolidado', roles: ['csj', 'deaj'] },
  { href: '/actualizacion', label: 'Actualización de datos', roles: ['office'] },
]

const HeaderLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname()
  const isLinkActive = (href: string) => pathname === href

  return (
    <Link href={href} className={cn('text-xl text-slate-900', { 'font-bold underline': isLinkActive(href) })}>
      {label}
    </Link>
  )
}

export function Header({ username, role }: { username: string; role: UserRole }) {
  const router = useRouter()

  const [formState, logoutUser] = useFormState(logoutUserAction, { success: false })

  const onLogout = () => {
    logoutUser()
  }

  useEffect(() => {
    if (formState.success) router.push('/login')
  }, [formState])

  return (
    <header className="flex flex-row items-center justify-end gap-8 bg-slate-100 px-4 py-2 shadow-xl">
      {links.map((link) => {
        if (link.roles.includes(role)) {
          return <HeaderLink key={link.href} href={link.href} label={link.label} />
        }
      })}

      <div className="grow"></div>

      <div className="flex flex-row items-center gap-2">
        <span className="font-bold text-sky-800">
          {username} - {role}
        </span>
        <Button variant="link" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
