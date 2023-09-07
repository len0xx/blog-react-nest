import PostPage from '@/components/PostPage'
import { API_ENDPOINT_BACK } from '@/config'
import { Post, Author, HTTPError } from '@/util'

const getData = async (slug: string): Promise<Post> => {
	const res = await fetch(
        `${ API_ENDPOINT_BACK }/api/post/slug/${ slug }`,
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

interface PageProps {
	params: {
		slug: string 
	}
}

export default async ({ params: { slug } }: PageProps) => {
	const post = await getData(slug)
    const author = await getAuthor(post.authorId)

	return (
		<PostPage
            title={ post.title }
            content={ post.content }
            author={ author }
            createdAt={ post.createdAt }
        />
	)
}
