import { expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import PostPage from '../components/PostPage'

test('Post page', () => {
    const postEntity = {
        title: "Hello Vitest",
        createdAt: new Date(),
        rawContent: `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Start typing here"}]}]}`,
        renderedContent: 'Start typing here'
    }

    render(<PostPage title={ postEntity.title } content={ postEntity.rawContent } createdAt={ postEntity.createdAt } />)

    const post = within(screen.getByTestId('post-content'))

    expect(
        post.getByRole('heading', { level: 1, name: postEntity.title })
    ).toBeDefined()

    expect(
        post.getByText(postEntity.renderedContent)
    ).toBeDefined()
})
