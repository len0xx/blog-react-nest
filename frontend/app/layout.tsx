import './styles/globals.css'
import Button from '@/components/Button'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from "./providers"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LogOut from '@/components/LogOut'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My blog',
  description: 'Created with Next.js'
}

export default async function RootLayout({
  children,
}: {
	children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    const authenticated = !!(session && session.user)

	return (
		<html lang="en">
			<body className={inter.className}>
                <NextAuthProvider>
                    <main>
                        <header>
                            <div className="header-title"><a href="/">Blog</a></div>
                            <div className='buttons'>
                                { authenticated ? 
                                    <>
                                        <a href="/new"><Button>New Post</Button></a>
                                        <a href={ `/user/${ session.user.id }` }><Button appearance='default'>Profile</Button></a>
                                        <LogOut />
                                    </>
                                    :
                                    <>
                                        <a href="/login"><Button>Log in</Button></a>
                                        <a href="/reg"><Button appearance='default'>Sign Up</Button></a>
                                    </>
                                }
                            </div>
                        </header>
                        { children }
                    </main>
                    <footer>
                        <div><b>Blog</b> © { new Date().getFullYear() === 2023 ? 2023 : `2023 - ${ new Date().getFullYear() }` }</div>
                        <div>Source code is available on <a href="https://github.com/len0xx/blog-react-nest">GitHub</a></div>
                    </footer>
                </NextAuthProvider>
            </body>
		</html>
	)
}
