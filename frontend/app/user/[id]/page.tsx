import { API_ENDPOINT_BACK } from '@/config'
import { HTTPError, User, Post } from '@/util'
import UserProfile from '@/components/UserProfile'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const getData = async (id: number): Promise<User> => {
	if (isNaN(id)) {
        throw new HTTPError(400, 'Invalid user id')
    }

	const res = await fetch(
        `${ API_ENDPOINT_BACK }/api/user/${ id }`,
        { cache: 'no-store' }
    )

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the user data')

    let data = await res.json()
	return data! as User
}

interface PostsResponse {
    posts: Post[]
    pages: number
    count: number
}

const getPosts = async (id: number, page: number): Promise<PostsResponse> => {
	if (isNaN(id)) {
        throw new HTTPError(400, 'Invalid author id')
    }

	const res = await fetch(
        `${ API_ENDPOINT_BACK }/api/post?author=${ id }&page=${ page }`,
        { cache: 'no-store' }
    )

    if (!res.ok) throw new HTTPError(res.status, 'Could not load the posts')

    let data = await res.json()
	return data! as PostsResponse
}

interface SearchParams {
    [key: string]: string | string[] | undefined
}

interface PageProps {
	params: {
		id: string 
	}
    searchParams: SearchParams
}

export default async ({ params: { id }, searchParams }: PageProps) => {
    const session = await getServerSession(authOptions)
    const page = searchParams['page'] && !isNaN(+searchParams['page']) ? +searchParams['page'] : 1
	const user = await getData(+id)
    const postsData = await getPosts(+id, page)

	return (
		<UserProfile
            user={ user }
            editable={ session && user.id === session.user.id || false }
            options={ !!(session && session.user) }
            authorizedId={ (session && session.user) ? session.user.id : undefined }
            token={ session && session.user.backendToken || undefined }
            posts={ postsData.posts }
            pages={ postsData.pages }
            count={ postsData.count }
        />
	)
}
