'use client'

import { FileSpreadsheet } from 'lucide-react'
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
      <Button variant="secondary" disabled={clicked} className="my-4 space-x-2">
        <FileSpreadsheet className="h-6 w-6" />
        <span>Descargar consolidado</span>
      </Button>
    </Link>
  )
}
