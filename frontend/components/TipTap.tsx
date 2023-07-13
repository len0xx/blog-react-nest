import {
    BubbleMenu,
    EditorContent,
    FloatingMenu,
    ReactNodeViewRenderer,
    useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Ref, forwardRef, useImperativeHandle, useRef } from 'react'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import CodeBlockComponent from './CodeBlock'
import { lowlight } from 'lowlight'
import { API_ENDPOINT } from '@/config'
import '@/app/styles/tiptap.css'

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

const TipTap = forwardRef<Editor, {}>((_props, ref: Ref<Editor>) => {
    const fileInput = useRef<HTMLInputElement | null>(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
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

    const addImage = () => {
        fileInput.current!.removeAttribute('disabled')
        fileInput.current!.click()
        fileInput.current!.setAttribute('disabled', '')
    }

    const fileSelected = async () => {
        const data = new FormData()
        data.append('file', fileInput.current!.files![0])

        const res = await fetch(`${API_ENDPOINT}/api/files`, { method: 'POST', body: data })
        const response = (await res.json()) as ImagesResponse
        console.log(response)
        
        if (res.ok) {
            const url = response.url
            editor!.chain().focus().setImage({ src: url }).run()
        }
    }

    const publicRef = {
        getJSON: () => editor!.getJSON()
    }

    useImperativeHandle(ref, () => publicRef)

    return (
        <>
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
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    type="button"
                    className={editor.isActive('strike') ? 'is-active' : ''}
                >
                    Strike
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
            <input type="file" disabled name="tiptap-image-upload" ref={ fileInput } onInput={ fileSelected } style={{ display: 'none' }} />
        </>
    )

})

export default TipTap
