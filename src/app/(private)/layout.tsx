import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Header } from '~/app/_components/header'
import { TRPCReactProvider } from '~/trpc/react'
import { api } from '~/trpc/server'

export const metadata: Metadata = {
  title: 'Cargos',
  description: 'Revisión de planta de personal Seccional Boyacá y Casanare',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await api.users.getLoggedUser()

  if (!user.username) redirect('/login')

  return (
    <html lang="es" className={`${GeistSans.variable}`}>
      <body>
        <Header username={user.username} />
        <main className="flex flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </div>
        </main>
      </body>
    </html>
  )
}
