import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"

interface WysiwygEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const btnStyle = (active: boolean) => ({
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
    background: active ? "#2563eb" : "white",
    color: active ? "white" : "#374151",
    cursor: "pointer" as const,
    fontSize: "13px",
    fontWeight: 500 as const,
    lineHeight: "1",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minWidth: "28px",
    height: "28px",
  })

  const sep = { width: "1px", height: "20px", background: "#e5e7eb", margin: "0 4px" }

  const addImage = () => {
    const url = window.prompt("URL de l'image :")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addLink = () => {
    const url = window.prompt("URL du lien :")
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", padding: "8px", borderBottom: "1px solid #e5e7eb", background: "#fafafa", borderRadius: "8px 8px 0 0" }}>
      <button type="button" style={btnStyle(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras">
        <strong>B</strong>
      </button>
      <button type="button" style={btnStyle(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique">
        <em>I</em>
      </button>
      <button type="button" style={btnStyle(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné">
        <u>U</u>
      </button>
      <button type="button" style={btnStyle(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré">
        <s>S</s>
      </button>

      <div style={sep} />

      <button type="button" style={btnStyle(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre H2">
        H2
      </button>
      <button type="button" style={btnStyle(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre H3">
        H3
      </button>
      <button type="button" style={btnStyle(editor.isActive("heading", { level: 4 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="Titre H4">
        H4
      </button>

      <div style={sep} />

      <button type="button" style={btnStyle(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">
        &#8226;
      </button>
      <button type="button" style={btnStyle(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
        1.
      </button>
      <button type="button" style={btnStyle(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">
        &ldquo;
      </button>

      <div style={sep} />

      <button type="button" style={btnStyle(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Aligner à gauche">
        &#8676;
      </button>
      <button type="button" style={btnStyle(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Centrer">
        &#8596;
      </button>
      <button type="button" style={btnStyle(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Aligner à droite">
        &#8677;
      </button>

      <div style={sep} />

      <button type="button" style={btnStyle(editor.isActive("link"))} onClick={addLink} title="Lien">
        &#128279;
      </button>
      <button type="button" style={btnStyle(false)} onClick={addImage} title="Image">
        &#128247;
      </button>

      <div style={sep} />

      <button type="button" style={btnStyle(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne horizontale">
        &#8213;
      </button>
      <button type="button" style={btnStyle(false)} onClick={() => editor.chain().focus().undo().run()} title="Annuler">
        &#8634;
      </button>
      <button type="button" style={btnStyle(false)} onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
        &#8635;
      </button>
    </div>
  )
}

const WysiwygEditor = ({ content, onChange, placeholder }: WysiwygEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder || "Commencez à écrire..." }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content])

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      <MenuBar editor={editor} />
      <div style={{ padding: "12px", minHeight: "300px" }}>
        <style>{`
          .ProseMirror { outline: none; min-height: 280px; font-size: 14px; line-height: 1.7; color: #374151; }
          .ProseMirror h2 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; color: #111827; }
          .ProseMirror h3 { font-size: 17px; font-weight: 600; margin: 14px 0 6px; color: #1f2937; }
          .ProseMirror h4 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; color: #374151; }
          .ProseMirror p { margin: 0 0 8px; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 20px; margin: 8px 0; }
          .ProseMirror li { margin: 4px 0; }
          .ProseMirror blockquote { border-left: 3px solid #2563eb; padding-left: 12px; color: #6b7280; margin: 12px 0; }
          .ProseMirror a { color: #2563eb; text-decoration: underline; }
          .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
          .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
          .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0; }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default WysiwygEditor
