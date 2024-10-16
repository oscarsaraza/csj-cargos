'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/ui/button'

export function DescargaXlsxButton() {
  const [clicked, setClicked] = useState(false)

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (clicked) event.preventDefault()
    setClicked(true)
  }

  return (
    <Link href="/consolidado/xlsx" onClick={onClick}>
      <Button variant="secondary" disabled={clicked}>
        Descargar consolidado
      </Button>
    </Link>
  )
}
