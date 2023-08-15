import Posts from '@/components/Posts'
import { API_ENDPOINT_BACK } from '@/config'
import { Post } from '@/util'

interface PostsResponse {
    posts: Post[]
    pages: number
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

export default async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
    const page = searchParams['page'] && !isNaN(+searchParams['page']) ? +searchParams['page'] : 1
	const data = await getData(page)
    const posts = data.posts
    const pages = data.pages

	return (
		<>
            <h2>Most recent posts</h2>
            <br />
			{ posts && posts.length ? (
                <Posts posts={ posts } pages={ pages } />
			) : ( 
				<p>No posts found</p>
			)}
		</>
	)
}
