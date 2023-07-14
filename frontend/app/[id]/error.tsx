'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Button from '@/components/Button'

export default function Error({
    error,
    reset,
}: {
        error: Error
        reset: () => void
    }) {

    let heading = error.message

    useEffect(() => {
        heading = error.message
        console.error(error)
    }, [error])

    return (
        <>
            <h2>{ heading }</h2><br />
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try reloading the page
            </Button>
            <span className='text-margin'>or</span>
            <a href="/">Go to the main page</a>
        </>
    )
}
