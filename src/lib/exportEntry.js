import jsPDF from "jspdf";

function htmlToPlainLines(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  const text = div.innerText || div.textContent || "";
  return text.split("\n").filter((l) => l.trim().length);
}

function htmlToMarkdown(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  let md = "";
  div.childNodes.forEach((node) => {
    md += nodeToMd(node);
  });
  return md.trim();
}

function nodeToMd(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  const tag = node.tagName?.toLowerCase();
  const inner = Array.from(node.childNodes).map(nodeToMd).join("");
  switch (tag) {
    case "h2": return `## ${inner}\n\n`;
    case "p": return `${inner}\n\n`;
    case "strong": case "b": return `**${inner}**`;
    case "em": case "i": return `*${inner}*`;
    case "u": return `_${inner}_`;
    case "blockquote": return `> ${inner}\n\n`;
    case "ul": return Array.from(node.children).map((li) => `- ${nodeToMd(li)}`).join("") + "\n";
    case "ol": return Array.from(node.children).map((li, i) => `${i + 1}. ${nodeToMd(li)}`).join("") + "\n";
    case "li": return `${inner}\n`;
    case "br": return "\n";
    default: return inner;
  }
}

export function downloadMarkdown(entry) {
  const front = `# ${entry.title || "Untitled entry"}\n\n_${entry.date} · mood: ${entry.mood}${entry.tags?.length ? ` · tags: ${entry.tags.join(", ")}` : ""}_\n\n`;
  const body = htmlToMarkdown(entry.content);
  const blob = new Blob([front + body], { type: "text/markdown" });
  triggerDownload(blob, `${fileSafe(entry.title || entry.date)}.md`);
}

export function downloadPdf(entry) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(entry.title || "Untitled entry", maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 120, 110);
  doc.text(`${entry.date}  ·  mood: ${entry.mood}${entry.tags?.length ? `  ·  tags: ${entry.tags.join(", ")}` : ""}`, margin, y);
  y += 24;

  doc.setTextColor(20, 30, 20);
  doc.setFontSize(11.5);
  const lines = htmlToPlainLines(entry.content);
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, maxWidth);
    wrapped.forEach((w) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(w, margin, y);
      y += 16;
    });
    y += 6;
  });

  doc.save(`${fileSafe(entry.title || entry.date)}.pdf`);
}

function fileSafe(s) {
  return (s || "entry").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "entry";
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
