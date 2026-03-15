export const metadata = {
  title: 'Runflow',
  description: 'Suivi de course et plans d\'entraînement personnalisés',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}