import PostPage from '@/components/PostPage'
import { API_ENDPOINT_BACK } from '@/config'
import { HTTPError } from '@/util'

interface Post {
	id: number
	title: string
	content: string
	published: boolean
}

interface PageOptions {
	params: {
		id: number
	}
}

const getData = async (id: number): Promise<Post> => {
	if (isNaN(id)) throw new HTTPError(400, 'Invalid post id')

	const res = await fetch(`${ API_ENDPOINT_BACK }/api/post/${ id }`, { cache: 'no-store' })
    let data: Post = await res.json()

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the post')

	return data!
}

export default async function Home({ params }: PageOptions) {
	const data = await getData(+params.id)

	return (
		<PostPage title={ data.title } content={ data.content } />	
	)
}
