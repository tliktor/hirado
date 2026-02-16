export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <head>
        <title>Hiradó - Fotó feltöltés</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
