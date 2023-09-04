'use client'

import dayjs from 'dayjs'
import Content from './Content'
import { Author, getProfileLink } from '@/util'

interface ComponentProps {
	title: string
	content: string
    createdAt: Date
    author?: Author
}

export default function PostPage({ title, content, author, createdAt }: ComponentProps) {
	return (
		<div className='post-page-content' data-testid="post-content">
			<h1>{ title }</h1><br />
            { author && <>
                <p className="post-page-author">
                    <span>Author: </span>
                    <a href={ getProfileLink(author.id) } title={ `Open ${ author.fullName }'s profile page` }>
                        { author.fullName }
                    </a>
                </p>
                <br />
            </> }
			<Content content={ content } /><br /><br />
            <p className="post-page-date">Published at { dayjs(createdAt).format('DD.MM.YYYY, HH:mm') }</p>
		</div>
	)
}
