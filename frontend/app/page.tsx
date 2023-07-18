import Card from '@/components/Card'
import { API_ENDPOINT_BACK } from '@/config'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

interface Post {
	id: number
	title: string
	content: string
	published: boolean
}

const getData = async (): Promise<Post[]> => {
	const res = await fetch(`${ API_ENDPOINT_BACK }/api/post`, { cache: 'no-store' })

	if (!res.ok) {
		throw new Error('Failed to fetch data')
	}

	return res.json()
}

export default async () => {
	const data = await getData()
    const session = await getServerSession(authOptions)
    console.log(session)

	return (
		<>
			{ data && data.length ? (
				<div className="posts">
					{ data.map(post => 
						<Card key={ post.id } id={ post.id } title={ post.title } text={ post.content } />)
					}
				</div>
			) : ( 
				<p>No posts found</p>
			)}
		</>
	)
}
