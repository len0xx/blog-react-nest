'use client'

import Content from './Content'

interface ComponentProps {
	title: string
	content: string
}

export default function PostPage({ title, content }: ComponentProps) {
	return (
		<div className='post-page-content' data-testid="post-content">
			<h1>{ title }</h1><br />
			<Content content={ content } /><br />
		</div>
	)
}
