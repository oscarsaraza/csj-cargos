'use client'

import { useState } from 'react'
import { Input } from '~/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { RouterOutputs } from '~/trpc/react'

type Despacho = RouterOutputs['despachos']['list'][number]

export default function ListaDespachos({ despachos }: { despachos: Despacho[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDespachos = despachos.filter(
    (despacho) =>
      despacho.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <Input
        type="text"
        placeholder="Buscar despachos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
        aria-label="Buscar despachos"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Despacho</TableHead>
            <TableHead>Correo electrónico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDespachos.map(({ id, nombre, email }) => (
            <TableRow key={id}>
              <TableCell>{nombre}</TableCell>
              <TableCell>{email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredDespachos.length === 0 && (
        <p className="mt-4 text-center text-gray-500">No hay resultados para la búsqueda especificada.</p>
      )}
    </div>
  )
}
