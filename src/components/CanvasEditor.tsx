import { useEffect, MutableRefObject } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Editor } from '@tiptap/react'

interface Props {
  editorRef: MutableRefObject<Editor | null>
  isStreaming: boolean
  onSelectionAction: (action: string, text: string, from: number, to: number) => void
}

const ACTIONS = [
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'expand',  label: 'Expand'  },
  { id: 'shorten', label: 'Shorten' },
  { id: 'fix',     label: 'Fix'     },
  { id: 'formal',  label: 'Formal'  },
  { id: 'casual',  label: 'Casual'  },
]

const ToolbarBtn = ({
  active, onClick, children, title,
}: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title?: string
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`px-2 py-1 rounded text-xs font-medium transition-colors select-none ${
      active ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
)

const Sep = () => <div className="w-px h-4 bg-slate-200 mx-0.5" />

export default function CanvasEditor({ editorRef, isStreaming, onSelectionAction }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Placeholder.configure({
        placeholder: 'Start writing here, or switch to Canvas mode and describe what you want the AI to write…',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-slate prose-p:leading-relaxed max-w-none px-16 py-12 min-h-full focus:outline-none',
      },
    },
  })

  useEffect(() => {
    editorRef.current = editor
    return () => { editorRef.current = null }
  }, [editor, editorRef])

  const act = (id: string) => {
    if (!editor || isStreaming) return
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, '\n')
    if (!text.trim()) return
    onSelectionAction(id, text, from, to)
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
        <ToolbarBtn active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold (⌘B)">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough">
          <s>S</s>
        </ToolbarBtn>
        <Sep />
        {([1, 2, 3] as const).map(level => (
          <ToolbarBtn
            key={level}
            active={editor?.isActive('heading', { level })}
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
          >
            H{level}
          </ToolbarBtn>
        ))}
        <Sep />
        <ToolbarBtn active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">
          • —
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">
          1.
        </ToolbarBtn>
        <Sep />
        <ToolbarBtn active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">
          ❝
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()} title="Inline code">
          &lt;/&gt;
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code block">
          ≡
        </ToolbarBtn>
        <Sep />
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo (⌘Z)">↩</ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo (⌘⇧Z)">↪</ToolbarBtn>

        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            AI writing…
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 120, placement: 'top' }}
            shouldShow={({ editor: e }) => !e.state.selection.empty && !isStreaming}
          >
            <div className="flex items-center bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
              {ACTIONS.map((action, i) => (
                <button
                  key={action.id}
                  onClick={() => act(action.id)}
                  className={`px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors ${
                    i > 0 ? 'border-l border-slate-700' : ''
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
