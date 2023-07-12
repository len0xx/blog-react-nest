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
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import 'highlight.js/styles/github-dark.css'
import hljs from 'highlight.js'
import Image from '@tiptap/extension-image'

lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('js', js)
lowlight.registerLanguage('ts', ts)

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
                CodeBlockLowlight
            ]
        ),
        [jsonContent]
    )

	return <div dangerouslySetInnerHTML={{ __html: text }} />
}
