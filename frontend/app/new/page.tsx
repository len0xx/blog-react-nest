import NewForm from '@/components/NewForm'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export default async () => {
    const session = await getServerSession(authOptions)

	return (
		<>
			<h1>Create a new post</h1><br />
            <NewForm session={ session! } />
        </>
	)
}
