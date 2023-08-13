import Profile from "@/components/Profile"

export default ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
    const page = searchParams['page'] && !isNaN(+searchParams['page']) ? +searchParams['page'] : 1

    return <Profile page={ page } />
}
