import Posts from '@/components/Posts'
import { API_ENDPOINT_BACK } from '@/config'
import { authOptions } from '@/lib/auth'
import { Post } from '@/util'
import { getServerSession } from 'next-auth'

interface PostsResponse {
    posts: Post[]
    pages: number
}

interface SearchParams {
    [key: string]: string | string[] | undefined
}

const getData = async (page = 1): Promise<PostsResponse> => {
    const url = `${ API_ENDPOINT_BACK }/api/post?page=${ page }`
	const res = await fetch(url, { cache: 'no-store' })

	if (!res.ok) {
		throw new Error('Failed to fetch data')
	}

    const response = await res.json()
	return response
}

interface PageProps {
    searchParams: SearchParams
}

export default async ({ searchParams }: PageProps) => {
    const session = await getServerSession(authOptions)
    const authorized = !!(session && session.user)
    const page = searchParams['page'] && !isNaN(+searchParams['page']) ? +searchParams['page'] : 1
	const data = await getData(page)
    const posts = data.posts
    const pages = data.pages

	return (
		<>
            <h2>Most recent posts</h2>
            <br />
			{ posts && posts.length ? (
                <Posts
                    posts={ posts }
                    pages={ pages }
                    token={ authorized ? session.user.backendToken : undefined }
                    options={ authorized }
                    userId={ authorized ? session.user.id : undefined }
                />
			) : ( 
				<p>No posts found</p>
			)}
		</>
	)
}
