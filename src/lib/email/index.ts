import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type SendEmailProps = {
  subject: string
  to: string
  html: string
}

export async function sendEmail({ subject, to, html }: SendEmailProps) {
  if (process.env.NODE_ENV === 'development') {
    // Test adress for development only
    to = 'delivered@resend.dev'
    console.log({ subject, to, html })
  }

  const from = 'Consejo Seccional de la Judicatura - Boyacá y Casanare <app@csbc.app>'
  const { data } = await resend.emails.send({ from, to: [to], subject, html })

  if (data?.id) return data.id
  return null
}
