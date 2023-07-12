import '@/app/styles/code.css'
import 'highlight.js/styles/github-dark.css'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

interface CodeBlockNode {
    attrs: {
        language: string
    }
}

interface CodeBlockExtension {
    options: {
        lowlight: {
            listLanguages: () => string[]
        }
    }
}

interface CodeBlockProps {
    node: CodeBlockNode
    updateAttributes: (a: { language: string }) => void
    extension: CodeBlockExtension
}

export default function CodeBlock (
    {
        node: { attrs: { language: defaultLanguage } },
        updateAttributes,
        extension
    }: CodeBlockProps
) {
    return (
        <NodeViewWrapper className="code-block">
            <select 
                className="code-block-selector"
                contentEditable={false}
                defaultValue={defaultLanguage}
                onChange={event => updateAttributes({ language: event.target.value })}
            >
                <option value="null">
                    auto
                </option>
                <option disabled>
                    —
                </option>
                {extension.options.lowlight.listLanguages().map((lang, index) => (
                    <option key={index} value={lang}>
                        {lang}
                    </option>
                ))}
            </select>
            <pre>
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    )
}
