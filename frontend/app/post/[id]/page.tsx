import PostPage from '@/components/PostPage'
import { API_ENDPOINT_BACK } from '@/config'
import { Post, Author, HTTPError } from '@/util'

interface PageOptions {
	params: {
		id: string 
	}
}

const getData = async (id: number): Promise<Post> => {
	if (isNaN(id)) {
        throw new HTTPError(400, 'Invalid post id')
    }

	const res = await fetch(
        `${ API_ENDPOINT_BACK }/api/post/${ id }`,
        { cache: 'no-store' }
    )

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the post')

    let data = await res.json()
	return data! as Post
}

const getAuthor = async (id: number): Promise<Author> => {
    const res = await fetch(
        `${ API_ENDPOINT_BACK }/api/user/${ id }`,
        { cache: 'no-store' }
    )

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the author')

    let data = await res.json()
	return data! as Author
}

export default async ({ params: { id } }: PageOptions) => {
	const post = await getData(+id)
    const author = await getAuthor(post.authorId)

	return (
		<PostPage title={ post.title } content={ post.content } author={ author } />
	)
}
