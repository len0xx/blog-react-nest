import PostPage from '@/components/PostPage'
import { API_ENDPOINT_BACK } from '@/config'
import { HTTPError } from '@/util'

interface Post {
	id: number
	title: string
	content: string
	published: boolean
    authorId: number
}

interface Author {
    id: number
    firstName: string
    lastName: string
    fullName: string
}

interface PageOptions {
	params: {
		id: string 
	}
}

const getData = async (id: number): Promise<Post> => {
	if (isNaN(+id)) {
        throw new HTTPError(400, 'Invalid post id')
    }

	const res = await fetch(`${ API_ENDPOINT_BACK }/api/post/${ id }`, { cache: 'no-store' })

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the post')

    let data = await res.json()
	return data! as Post
}

const getAuthor = async (id: number): Promise<Author> => {
	if (isNaN(+id)) {
        throw new HTTPError(500, 'Invalid author id')
    }

    const res = await fetch(`${ API_ENDPOINT_BACK }/api/post/author/${ id }`, { cache: 'no-store' })

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the author')

    let data = await res.json()
	return data! as Author
}

export default async ({ params: { id } }: PageOptions) => {
	const post = await getData(+id)
    const author = await getAuthor(post.id)

	return (
		<PostPage title={ post.title } content={ post.content } author={ author } />
	)
}
