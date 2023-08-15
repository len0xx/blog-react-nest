'use client'

import Content from './Content'

interface Author {
    id: number
    firstName: string
    lastName: string
    fullName: string
}

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
