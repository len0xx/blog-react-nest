import './styles/globals.css'
import Button from '@/components/Button'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My blog',
  description: 'Created with Next.js'
}

export default function RootLayout({
  children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
                <main>
                    <header>
                        <div className="header-title"><a href="/">Blog</a></div>
                        <div>
                            <a href="/new"><Button>New Post</Button></a>
                        </div>
                    </header>
                    { children }
                </main>
            </body>
		</html>
	)
}
