import { RouterOutputs } from '~/trpc/react'

export type DatosUdaeRow = RouterOutputs['cargos']['getPairingData']['datosUdae'][0]
export type DatosCsjRow = RouterOutputs['cargos']['getPairingData']['datosCsj'][0]
export type TableColumn = { name: string; type: string; prettyName: string }
export type FilterItem = { column: string; value: string }

export const ITEMS_PER_PAGE = 10
