import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export function UnauthorizedUserMessage({ email }: { email: string }) {
  return (
    <div className="flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Acceso no autorizado</CardTitle>
          <div className="text-center font-bold text-muted-foreground">Consolidación de cargos - UDAE</div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm">
            La dirección de correo electrónico <span className="font-bold">{email}</span> no se encuentra configurada
            para acceder a esta sección.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
