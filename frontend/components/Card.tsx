'use client'

import { Dialog, Menu, Popover, Position } from 'evergreen-ui'
import Content from './Content'
import '@/app/styles/card.css'
import { useEffect, useState } from 'react'
import { Post, callAPI } from '@/util'
import { toaster } from 'evergreen-ui'
import dayjs from 'dayjs'

interface Props {
    post: Post
    saved?: boolean
    token?: string
    favouritable?: boolean
    editable?: boolean
    options: boolean
    children?: React.ReactNode
    onDelete?: (id: number) => void
}

interface FavouriteResponse {
    ok: boolean
    state: boolean
}

export default function CardComponent({
    post,
    editable = false,
    favouritable = false,
    options = false,
    token,
    onDelete,
    saved
}: Props) {
    const [ isDialogShown, setShown ] = useState(false)
    const [ isSaved, setSaved ] = useState(saved)

    const confirmDeletion = async () => {
        try {
            await callAPI(`/api/post/${ post.id }`, { method: 'DELETE', token })
            if (onDelete) onDelete(post.id)
            toaster.success('The post has successfully been deleted')
        }
        catch (e) {
            console.error(`The post with id ${ post.id } was not deleted`)
            toaster.danger(
                'The post was not deleted due to an unexpected error',
                { description: 'Please try again later' }
            )
        }
        finally {
        }
    }

    const addToFavourites = async () => {
        try {
            const response = await callAPI<FavouriteResponse>(
                `/api/post/favourite/${ post.id }`,
                { method: 'POST', token, payload: {} }
            )
            setSaved(response.state)

            if (response.state) toaster.success('The post has been saved to favourites')
            else toaster.success('The post has been removed from favourites')
        }
        catch (e) {
            console.error(`The post with id ${ post.id } was not saved to favourites`)
            toaster.danger(
                'The post was not saved to favourites due to an unexpected error',
                { description: 'Please try again later' }
            )
        }
        finally { }
    }

    useEffect(() => setSaved(saved), [ saved ])

    return (
        <>
            <Dialog
                isShown={ isDialogShown }
                title="Are you sure you want to delete this post?"
                onConfirm={ confirmDeletion }
                onCloseComplete={ () => setShown(false) }
                confirmLabel="Delete"
                minHeightContent={ 0 }
            >
                Confirm your action
            </Dialog>
            <div className="card">
                <div className="card-title">
                    <div>
                        <a href={ post.slug ? `/${ post.slug }` : `/post/${ post.id }` }>{ post.title }</a>
                    </div>
                    <div>
                        { options &&
                            <Popover
                                position={Position.BOTTOM_RIGHT}
                                content={
                                    <div className="menu-wrapper">
                                        <Menu>
                                            <Menu.Group>
                                                { favouritable && <Menu.Item onSelect={ addToFavourites }>{ isSaved ? 'Remove from Saved' : 'Save' }</Menu.Item> }
                                                { editable && <a href={ `/edit/${ post.id }` }><Menu.Item>Edit the post</Menu.Item></a> }
                                            </Menu.Group>
                                            <Menu.Divider />
                                            { editable &&
                                                <Menu.Group>
                                                    <Menu.Item onSelect={() => setShown(true)} intent="danger">
                                                        Delete
                                                    </Menu.Item>
                                                </Menu.Group>
                                            }
                                        </Menu>
                                    </div>
                                }
                            >
                                <div className="breadcrumbs">
                                    <span className="brcr" />
                                    <span className="brcr" />
                                    <span className="brcr" />
                                </div>
                            </Popover>
                        }
                    </div>
                </div>
                <div className="card-content">
                    <div className="card-text">
                        <Content content={ post.content } />
                    </div>
                    <div className="card-date">
                        Published at { dayjs(post.createdAt).format('DD.MM.YYYY, HH:mm') } (GMT+5)
                    </div>
                </div>
            </div>
        </>
    )
}
