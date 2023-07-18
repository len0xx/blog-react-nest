'use client'

import { Button } from 'evergreen-ui'

interface ComponentProps {
    appearance?: string
	children?: React.ReactNode
	onClick?: () => void
}

export default function ButtonComponent({ children, appearance = 'primary', onClick }: ComponentProps) {
	return <Button appearance={ appearance } onClick={ onClick }>
		{ children }
	</Button>
}
