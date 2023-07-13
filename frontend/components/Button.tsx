'use client'

import { Button } from 'evergreen-ui'

interface ComponentProps {
	children?: React.ReactNode
	onClick?: () => void
}

export default function ButtonComponent({ children, onClick }: ComponentProps) {
	return <Button appearance="primary" onClick={ onClick }>
		{ children }
	</Button>
}
