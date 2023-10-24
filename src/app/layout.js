

export const metadata = {
  title: 'Humanitarianism App',
  description: 'The A Team',
}

export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}