import { expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import PostPage from '../components/PostPage'

test('Post page', () => {
    const postEntity = {
        title: "Hello Vitest",
        content: "Blah blah blah"
    }

    render(<PostPage title={ postEntity.title } content={ postEntity.content } />)

    const post = within(screen.getByTestId('post-content'))

    expect(
        post.getByRole('heading', { level: 1, name: postEntity.title })
    ).toBeDefined()

    expect(
        post.getByText(postEntity.content)
    ).toBeDefined()
})
