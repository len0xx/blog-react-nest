import {
    BubbleMenu,
    EditorContent,
    FloatingMenu,
    ReactNodeViewRenderer,
    useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import CodeBlockComponent from './CodeBlock'
import { lowlight } from 'lowlight'
import { API_ENDPOINT } from '@/config'
import '@/app/styles/tiptap.css'
import { InlineAlert } from 'evergreen-ui'
import { useCallback } from 'react'

lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('js', js)
lowlight.registerLanguage('ts', ts)

interface Editor {
    getJSON: () => void
}

interface ImagesResponse {
    url: string
}

interface ErrorResponse {
    message?: string
}

const TipTap = forwardRef<Editor, {}>((_props, ref: Ref<Editor>) => {
    const fileInput = useRef<HTMLInputElement | null>(null)
    const [ error, setError ] = useState<boolean>(false)
    const [ errorText, setErrorText ] = useState<string | null>(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            CodeBlockLowlight
                .extend({
                    addNodeView() {
                        return ReactNodeViewRenderer(CodeBlockComponent)
                    }
                })
                .configure({ lowlight })
        ],
        content: '<p>Start typing here</p>'
    })

    const setLink = useCallback(() => {
        const previousUrl = editor!.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) {
            return
        }

        if (url === '') {
            editor!.chain().focus().extendMarkRange('link').unsetLink()
                .run()

            return
        }

        editor!.chain().focus().extendMarkRange('link').setLink({ href: url })
            .run()
    }, [editor])

    const addImage = () => {
        fileInput.current!.removeAttribute('disabled')
        fileInput.current!.click()
        fileInput.current!.setAttribute('disabled', '')
    }

    const fileSelected = async () => {
        const data = new FormData()
        data.append('file', fileInput.current!.files![0])

        const res = await fetch(`${API_ENDPOINT}/api/files`, { method: 'POST', body: data })
        
        if (res.ok) {
            setError(false)
            const response = (await res.json()) as ImagesResponse
            const url = response.url
            editor!.chain().focus().setImage({ src: url }).run()
        }
        else {
            setError(true)
            try {
                const response = (await res.json()) as ErrorResponse
                setErrorText(response.message || 'An unexpected error occurred, please try again later')
            }
            catch (e) {
                if (res.status == 413) {
                    setErrorText('The file is too large. Please select a smaller file and try again')
                }
                else {
                    setErrorText('An unexpected error occurred, please try again later')
                }
            }
        }
    }

    const publicRef = {
        getJSON: () => editor!.getJSON()
    }

    useImperativeHandle(ref, () => publicRef)

    return (
        <div className="editor-window">
            {editor && <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    type="button"
                    className={editor.isActive('bold') ? 'is-active' : ''}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    type="button"
                    className={editor.isActive('italic') ? 'is-active' : ''}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    type="button"
                    className={editor.isActive('underline') ? 'is-active' : ''}
                >
                    Underline
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    type="button"
                    className={editor.isActive('strike') ? 'is-active' : ''}
                >
                    Strike
                </button>
                <button
                    onClick={setLink}
                    type="button"
                    className={editor.isActive('link') ? 'is-active' : ''}
                >
                    Link
                </button>
                <button
                    onClick={() => console.log(editor.getJSON())}
                    type="button"
                >
                   Debug 
                </button>
            </BubbleMenu>}

            {editor && <FloatingMenu className="floating-menu" tippyOptions={{ duration: 100 }} editor={editor}>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    type="button"
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    type="button"
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                >
                    Bullet List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    type="button"
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                >
                    Code
                </button>
                <button
                    onClick={ addImage }
                    type="button"
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                >
                   Image 
                </button>
            </FloatingMenu>}

            <EditorContent editor={editor} />
            {error && <>
                <br />
                <InlineAlert intent="danger">Error: { errorText }</InlineAlert>
            </>}
            <input type="file" disabled name="tiptap-image-upload" ref={ fileInput } onInput={ fileSelected } style={{ display: 'none' }} accept="image/png, image/jpeg, image/svg+xml" />
        </div>
    )

})

export default TipTap
