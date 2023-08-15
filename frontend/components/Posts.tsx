'use client'

import { useEffect, useState } from 'react'
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
    editable?: boolean
    token?: string
}

export default ({ posts, pages, editable = false, token = undefined }: Props) => {
    const [ page, setPage ] = useState(1)
    const [ localPosts, setPosts ] = useState<Post[]>([])
    const router = useRouter()

    const postDeleted = (id: number) => {
        const newPosts = localPosts.filter((post) => post.id !== id)
        setPosts(newPosts)
    }

    const updatePage = (number: number) => {
        const path = window.location.pathname
        setPage(number)
        router.push(`${ path }?page=${ number }`)
    }

    const nextPage = () => page !== pages ? updatePage(page + 1) : page

    const prevPage = () => page !== 1 ? updatePage(page - 1) : page

    useEffect(() => {
        setPosts(posts)
    }, [ posts ])

    return (
        <>
            <div className="posts">
                { localPosts.map(post =>
                    <Card
                        id={ post.id }
                        title={ post.title }
                        text={ post.content }
                        editable={ editable }
                        token={ token }
                        onDelete={ postDeleted }
                    />)
                }
            </div>
            <br />
            <br />
            { pages > 1 && <Pagination page={ page } totalPages={ pages } onNextPage={ nextPage } onPreviousPage={ prevPage } onPageChange={ updatePage } /> }
        </>
    )
}
