import {
    EditorContent,
    BubbleMenu as BubbleMenuComponent,
    FloatingMenu,
    ReactNodeViewRenderer,
    useEditor
} from '@tiptap/react'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import BulletItem from '@tiptap/extension-list-item'
import { Ref, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import CodeBlockComponent from './CodeBlock'
import Blockquote from '@tiptap/extension-blockquote'
import { lowlight } from 'lowlight'
import { API_ENDPOINT } from '@/config'
import '@/app/styles/tiptap.css'
import { Dialog, InlineAlert, TextInput } from 'evergreen-ui'
import { FormEvent } from 'react'
import { isTextSelection } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('js', js)
lowlight.registerLanguage('ts', ts)

interface Editor {
    getJSON: () => any
    getText: () => string
}

interface ImagesResponse {
    url: string
}

interface ErrorResponse {
    message?: string
}

export interface UpdateDetails {
    editor: Editor
}

interface Props {
    initialContent?: string,
    onUpdate?: (details: UpdateDetails) => void
}

const TipTap = forwardRef<Editor, Props>(({ onUpdate, initialContent }: Props, ref: Ref<Editor>) => {
    const fileInput = useRef<HTMLInputElement | null>(null)
    const [ error, setError ] = useState<boolean>(false)
    const [ errorText, setErrorText ] = useState<string | null>(null)
    const [ isDialogShown, setIsDialogShown ] = useState(false)
    const [ linkUrl, setLinkUrl ] = useState('')
    const menuWrapper = useRef<HTMLDivElement | null>(null)

    const shouldShow = ({ view, state, from, to }: {
        view: EditorView,
        state: EditorState,
        from: number,
        to: number
    }) => {
        const { doc, selection } = state
        const { empty } = selection

        const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)
        const isChildOfMenu = menuWrapper.current!.contains(document.activeElement)
        const hasEditorFocus = view.hasFocus() || isChildOfMenu
        const blocksActive = editor!.isActive('image') || editor!.isActive('codeBlock') || editor!.isActive('heading')

        if (!hasEditorFocus || empty || isEmptyTextBlock || !editor!.isEditable || blocksActive) {
            return false
        }

        return true
    }

    const editor = useEditor({
        extensions: [
            Bold,
            Italic,
            Document,
            Paragraph,
            Text,
            Image,
            Heading,
            BulletList,
            BulletItem,
            Underline,
            Strike,
            Blockquote,
            Link.configure({
                openOnClick: false,
            }),
            CodeBlockLowlight
                .extend({
                    addNodeView() {
                        return ReactNodeViewRenderer(CodeBlockComponent)
                    }
                })
                .configure({
                    lowlight,
                    HTMLAttributes: {
                        class: 'post-code-block'
                    }
                })
        ],
        content: initialContent ? JSON.parse(initialContent) : '<p>Start typing here</p>'
    })

    useEffect(() => {
        if (editor && onUpdate) editor.on('update', onUpdate)
    })

    const openDialog = () => {
        setIsDialogShown(true)
    }

    const setLink = () => {
        if (linkUrl === null) {
            return
        }

        if (linkUrl === '') {
            editor!.chain().focus().extendMarkRange('link').unsetLink().run()

            return
        }

        editor!.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }

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
        getJSON: () => editor!.getJSON(),
        getText: () => editor!.getText()
    }

    useImperativeHandle(ref, () => publicRef)

    return (
        <div className="editor-window">
            <Dialog
                isShown={ isDialogShown }
                title="Set link URL"
                onCloseComplete={ () => setIsDialogShown(false) }
                onConfirm={ setLink }
                confirmLabel="Confirm"
                minHeightContent={ 0 }
            >
                <TextInput
                    placeholder="https://example.com"
                    onInput={(e: FormEvent<HTMLInputElement>) => setLinkUrl((e.target as HTMLInputElement).value)}
                    width="100%"
                />
            </Dialog>
            {editor && <div className="bubble-menu-wrapper" ref={ menuWrapper }>
                <BubbleMenuComponent editor={ editor } className="bubble-menu" tippyOptions={{ duration: 100, zIndex: 19 }} shouldShow={ shouldShow }>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        type="button"
                        className={ editor.isActive('bold') ? 'is-active' : '' }
                    >
                        <div className="editor-button-icon editor-icon-bold" title="Bold" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        type="button"
                        className={editor.isActive('italic') ? 'is-active' : ''}
                    >
                        <div className="editor-button-icon editor-icon-italic" title="Italic" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        type="button"
                        className={editor.isActive('underline') ? 'is-active' : ''}
                    >
                        <div className="editor-button-icon editor-icon-underline" title="Underline" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        type="button"
                        className={editor.isActive('strike') ? 'is-active' : ''}
                    >
                        <div className="editor-button-icon editor-icon-strike" title="Strikethrough" />
                    </button>
                    <button
                        onClick={openDialog}
                        type="button"
                        className={editor.isActive('link') ? 'is-active' : ''}
                    >
                        <div className="editor-button-icon editor-icon-link" title="Link" />
                    </button>
                </BubbleMenuComponent>
            </div>}

            {editor && <FloatingMenu className="floating-menu" tippyOptions={{ duration: 100 }} editor={editor}>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    type="button"
                >
                    <div className="editor-button-icon editor-icon-heading" title="Heading" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    type="button"
                >
                    <div className="editor-button-icon editor-icon-list" title="Bullet List" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    type="button"
                >
                        <div className="editor-button-icon editor-icon-code" title="Code Block" />
                </button>
                <button
                    onClick={ addImage }
                    type="button"
                >
                    <div className="editor-button-icon editor-icon-image" title="Insert Image" />
                </button>
                <button
                    onClick={ () => editor.chain().focus().toggleBlockquote().run() }
                    type="button"
                >
                    <div className="editor-button-icon editor-icon-quote" title="Insert Blockquote" />
                </button>
            </FloatingMenu>}

            <EditorContent editor={editor} />
            {error && <>
                <br />
                <InlineAlert intent="danger">Error: { errorText }</InlineAlert>
            </>}
            <input
                disabled
                type="file"
                name="tiptap-image-upload"
                ref={ fileInput }
                onInput={ fileSelected }
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/svg+xml"
            />
        </div>
    )

})

export default TipTap
