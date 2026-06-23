import '@/src/app/globals.css'

import { Footer } from '@/src/components/layout/Footer'
import { Header } from '@/src/components/layout/header/Header'
import { Main } from '@/src/components/layout/Main'

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ru'>
			<body>
				<div className='min-h-screen relative bg-background'>
					<Header />
					<Main>{children}</Main>
					<Footer />
				</div>
			</body>
		</html>
	)
}
