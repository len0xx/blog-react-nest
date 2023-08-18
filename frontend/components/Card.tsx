'use client'

import { Button, Dialog } from 'evergreen-ui'
import Content from './Content'
import '@/app/styles/card.css'
import { useEffect, useState } from 'react'
import { callAPI } from '@/util'
import { toaster } from 'evergreen-ui'

interface Props {
    title: string
    text: string
    id: number
    saved?: boolean
    token?: string
    favouritable?: boolean
    editable?: boolean
    children?: React.ReactNode
    onDelete?: (id: number) => void
}

interface FavouriteResponse {
    ok: boolean
    state: boolean
}

export default function CardComponent({ title, text, id, editable = false, favouritable = false, token, onDelete, saved }: Props) {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isLoadingFav, setIsLoadingFav ] = useState(false)
    const [ isDialogShown, setShown ] = useState(false)
    const [ isSaved, setSaved ] = useState(saved)

    const deletePost = async () => {
        try {
            setIsLoading(true)
            await callAPI(`/api/post/${ id }`, { method: 'DELETE', token })
            if (onDelete) onDelete(id)
            toaster.success('The post has successfully been deleted')
        }
        catch (e) {
            console.error(`The post with id ${ id } was not deleted`)
            toaster.danger('The post was not deleted due to an unexpected error', { description: 'Please try again later' })
        }
        finally {
            setIsLoading(false)
        }
    }

    const addToFavourites = async () => {
        try {
            setIsLoadingFav(true)
            const response = await callAPI<FavouriteResponse>(`/api/post/favourite/${ id }`, { method: 'POST', token, payload: {} })
            setSaved(response.state)
            if (response.state) toaster.success('The post has been saved to favourites')
            else toaster.success('The post has been removed from favourites')
        }
        catch (e) {
            console.error(`The post with id ${ id } was saved to favourites`)
            toaster.danger('The post was not saved to favourites due to an unexpected error', { description: 'Please try again later' })
        }
        finally {
            setIsLoadingFav(false)
        }
    }

    const closeDialog = () => {
        setShown(false)
        deletePost()
    }

    useEffect(() => setSaved(saved), [ saved ])

    return (
        <>
            <Dialog
                isShown={ isDialogShown }
                title="Are you sure you want to delete this post?"
                onCloseComplete={ closeDialog }
                confirmLabel="Delete"
                minHeightContent={ 0 }
            >
                Confirm your action
            </Dialog>
            <div className="card">
                <div className="card-title">
                    { title }
                </div>
                <div className="card-content">
                    <div className="card-text">
                        <Content content={ text } />
                    </div>	
                    <div className='card-footer'>
                        <a href={ `/post/${ id }` }>
                            <Button size="small" appearance="default" marginRight={ 10 }>
                                Open
                            </Button>
                        </a>
                        { favouritable && 
                            <Button
                                size="small"
                                appearance="default"
                                marginRight={ 10 }
                                onClick={ addToFavourites }
                                isLoading={ isLoadingFav }
                            >
                                { isSaved ? 'Saved' : 'Save' }
                            </Button>
                        }
                        { editable && 
                            <Button
                                size="small"
                                appearance="default"
                                intent='danger'
                                marginRight={ 10 }
                                onClick={ () => setShown(true) }
                                isLoading={ isLoading }
                            >
                                Delete
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
