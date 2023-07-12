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
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <main>
            <h2>Oops, Something went wrong!</h2><br />
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
        </main>
    )
}
