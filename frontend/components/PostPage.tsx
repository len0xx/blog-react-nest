'use client'

import Content from './Content'
import { Author } from '@/util'

interface ComponentProps {
	title: string
	content: string
    author: Author
}

export default function PostPage({ title, content, author }: ComponentProps) {
	return (
		<div className='post-page-content' data-testid="post-content">
			<h1>{ title }</h1><br />
            <p className="post-page-author">Author: { author.fullName }</p><br />
			<Content content={ content } /><br />
		</div>
	)
}
