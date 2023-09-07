import EditForm from '@/components/EditForm'
import { API_ENDPOINT_BACK } from '@/config'
import { authOptions } from '@/lib/auth'
import { HTTPError, Post } from '@/util'
import { getServerSession } from 'next-auth'

const getPost = async (id = 1): Promise<Post> => {
    if (isNaN(id)) {
        throw new HTTPError(400, 'Invalid post id')
    }

    const url = `${ API_ENDPOINT_BACK }/api/post/${ id }`
	const res = await fetch(url, { cache: 'no-store' })

	if (!res.ok) {
		throw new HTTPError(404, 'Not found')
	}

    const response = await res.json()
	return response as Post
}

interface PageProps {
	params: {
		id: string 
	}
}

export default async ({ params }: PageProps) => {
    const session = await getServerSession(authOptions)
    const post = await getPost(+params.id)

    if (!session || !session.user) {
        throw new HTTPError(401, 'Unauthorized')
    }
    else if (session && session.user && session.user.id !== post.authorId) {
        throw new HTTPError(403, 'Access restricted')
    }


	return <EditForm
        post={ post }
        token={ session ? session.user.backendToken : undefined }
    />
}
