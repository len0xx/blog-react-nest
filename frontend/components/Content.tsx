'use client'

import { useEffect, useMemo } from 'react'
import { generateHTML } from '@tiptap/react'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import BulletItem from '@tiptap/extension-list-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import 'highlight.js/styles/github-dark.css'
import hljs from 'highlight.js'
import '@/app/styles/tiptap.css'
import Strike from '@tiptap/extension-strike'

interface ComponentProps {
	content: string
}

export default function Content({ content }: ComponentProps) {
    useEffect(() => hljs.highlightAll(), [])

    const jsonContent = JSON.parse(content)

    const text = useMemo(
        () => generateHTML(
            jsonContent,
            [
                Bold,
                Italic,
                Document,
                Paragraph,
                Text,
                Image,
                Heading,
                BulletList,
                BulletItem,
                Link,
                Underline,
                Strike,
                CodeBlockLowlight.configure({
                    HTMLAttributes: {
                        class: 'post-code-block'
                    }
                })
            ]
        ),
        [jsonContent]
    )

	return <div className="post-content" dangerouslySetInnerHTML={{ __html: text }} />
}
