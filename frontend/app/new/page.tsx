import NewForm from '@/components/NewForm'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export default async () => {
    const session = await getServerSession(authOptions)

	return <NewForm session={ session! } />
}
