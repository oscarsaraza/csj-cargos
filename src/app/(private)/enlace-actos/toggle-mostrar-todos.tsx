'use client'

import Link from 'next/link'
import { useReducer } from 'react'
import { Button } from '~/components/ui/button'

export const ToggleMostrarTodos = ({ mostrarTodos }: { mostrarTodos: boolean }) => {
  const [clicked, setClicked] = useReducer((state) => !state, false)

  if (mostrarTodos)
    return (
      <Link href="/enlace-actos" prefetch={false}>
        <Button onClick={setClicked} disabled={clicked}>
          Mostrar solo registros pendientes
        </Button>
      </Link>
    )

  return (
    <Link href="/enlace-actos?todos=true" prefetch={false}>
      <Button onClick={setClicked} disabled={clicked}>
        Mostrar todos los registros
      </Button>
    </Link>
  )
}
