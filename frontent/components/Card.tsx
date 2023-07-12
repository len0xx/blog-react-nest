'use client'

import { Button } from 'evergreen-ui'
import Content from './Content'
import '@/app/styles/card.css'

interface CardProps {
	children?: React.ReactNode
	title: string
	text: string
	id: number
}

export default function CardComponent({ title, text, id }: CardProps) {
	return (
		<div className="card">
			<div className="card-title">
				{ title }
			</div>
			<div className="card-content">
			    <div className="card-text">
                    <Content content={ text } />
                </div>	
				<div className='card-footer'>
					<a href={ `/${ id }` }><Button size="small" appearance="default" marginRight={ 10 }>Open</Button></a>
				</div>
			</div>
		</div>
	)
}

