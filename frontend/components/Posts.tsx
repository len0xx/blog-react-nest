'use client'

import { useState } from 'react'
import Card from './Card'
import { Pagination } from 'evergreen-ui'
import { useRouter } from 'next/navigation'

interface Post {
	id: number
	title: string
	content: string
	published: boolean
}

interface Props {
    posts: Post[]
    pages: number
}

export default ({ posts, pages }: Props) => {
    const [ page, setPage ] = useState(1)
    const router = useRouter()

    const updatePage = (number: number) => {
        const path = window.location.pathname
        setPage(number)
        router.push(`${ path }?page=${ number }`)
    }

    const nextPage = () => page !== pages ? updatePage(page + 1) : page

    const prevPage = () => page !== 1 ? updatePage(page - 1) : page

    return (
        <>
            <div className="posts">
                { posts.map(post =>
                    <Card key={ post.id } id={ post.id } title={ post.title } text={ post.content } />)
                }
            </div>
            <br />
            <br />
            { pages > 1 && <Pagination page={ page } totalPages={ pages } onNextPage={ nextPage } onPreviousPage={ prevPage } onPageChange={ updatePage } /> }
        </>
    )
}
