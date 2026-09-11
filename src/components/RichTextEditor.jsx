import { useEffect, useRef } from "react";

const TOOLS = [
  { cmd: "bold", label: "B", title: "Bold", style: { fontWeight: 700 } },
  { cmd: "italic", label: "I", title: "Italic", style: { fontStyle: "italic" } },
  { cmd: "underline", label: "U", title: "Underline", style: { textDecoration: "underline" } },
  { cmd: "formatBlock:H2", label: "H2", title: "Heading" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bullet list" },
  { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
  { cmd: "formatBlock:BLOCKQUOTE", label: "❝", title: "Quote" },
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (ref.current && isFirstRender.current) {
      ref.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  function exec(cmd) {
    ref.current?.focus();
    if (cmd.startsWith("formatBlock:")) {
      document.execCommand("formatBlock", false, cmd.split(":")[1]);
    } else {
      document.execCommand(cmd, false, null);
    }
    onChange(ref.current.innerHTML);
  }

  return (
    <div>
      <div className="editor-toolbar">
        {TOOLS.map((t, i) => (
          <span key={t.cmd} style={{ display: "flex", alignItems: "center" }}>
            {i === 3 && <span className="divider-v" />}
            <button type="button" title={t.title} style={t.style} onMouseDown={(e) => { e.preventDefault(); exec(t.cmd); }}>
              {t.label}
            </button>
          </span>
        ))}
      </div>
      <div
        ref={ref}
        className="editor-surface"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
