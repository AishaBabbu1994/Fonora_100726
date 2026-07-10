"use client";

import { t } from "@/lib/i18n";

export default function ExportPdfButton({ locale, text, title }) {
  async function handleExport() {
    if (!text.trim()) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 56;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title || "Vozora", margin, margin);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(text, maxWidth);

    let y = margin + 28;
    const lineHeight = 16;
    const pageHeight = doc.internal.pageSize.getHeight();

    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save("vozora.pdf");
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="text-xs px-3 py-1.5 rounded-md border border-line text-ink hover:bg-surface2"
    >
      {t(locale, "export_pdf")}
    </button>
  );
}
