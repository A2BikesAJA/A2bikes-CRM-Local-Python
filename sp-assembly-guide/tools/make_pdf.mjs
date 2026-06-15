// Generate a printable PDF of the assembly guide from the same steps.json.
// Usage: node tools/make_pdf.mjs [out.pdf]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const dir = path.dirname(fileURLToPath(import.meta.url));
const doc = JSON.parse(
  fs.readFileSync(path.join(dir, "../src/content/steps.json"), "utf8")
);
const out = process.argv[2] || path.join(dir, "..", "A2-SP-Assembly-Guide.pdf");

const INK = "#14171b";
const MUTE = "#4a525b";
const RED = "#c8262b";
const ACCENT = "#1e4d78";

const pdf = new PDFDocument({ size: "LETTER", margin: 54 });
pdf.pipe(fs.createWriteStream(out));

pdf.fillColor(ACCENT).fontSize(22).font("Helvetica-Bold")
  .text(`${doc.meta.product} — Home Assembly Guide`);
pdf.moveDown(0.3).fillColor(MUTE).fontSize(10).font("Helvetica")
  .text("Your SP arrives ~90% assembled. Follow these steps to finish. Use a calibrated torque wrench.");
pdf.moveDown(0.3).fontSize(9)
  .text(`Tools: ${doc.toolsMaster.join("  ·  ")}`);
pdf.moveDown(0.5).strokeColor("#cccccc").moveTo(54, pdf.y).lineTo(558, pdf.y).stroke();
pdf.moveDown(0.6);

const ensure = (h) => {
  if (pdf.y + h > pdf.page.height - 60) pdf.addPage();
};

doc.steps.forEach((step, i) => {
  ensure(120);
  pdf.fillColor(INK).font("Helvetica-Bold").fontSize(14)
    .text(`${i + 1}.  ${step.title}`);
  pdf.fillColor(MUTE).font("Helvetica-Oblique").fontSize(10).text(step.summary);
  pdf.moveDown(0.3);

  (step.hazards || []).forEach((h) => {
    pdf.fillColor(RED).font("Helvetica-Bold").fontSize(10).text(`!  ${h}`);
    pdf.moveDown(0.2);
  });

  pdf.fillColor(INK).font("Helvetica").fontSize(10.5);
  step.substeps.forEach((t) => pdf.text(`[ ]  ${t}`, { indent: 8 }));

  (step.conditional || []).forEach((c) => {
    pdf.moveDown(0.2).fillColor(ACCENT).font("Helvetica-Bold").fontSize(10)
      .text(`${c.heading} (${c.builds.join(", ")})`);
    pdf.fillColor(MUTE).font("Helvetica").fontSize(9.5);
    c.body.forEach((b) => pdf.text(`-  ${b}`, { indent: 12 }));
  });

  if (step.torque.length) {
    pdf.moveDown(0.25).fillColor(INK).font("Helvetica-Bold").fontSize(10).text("Torque:");
    step.torque.forEach((t) => {
      const val = t.nm ? `${t.nm} N·m (${t.inlb} in-lb)` : t.note || "see printed spec";
      pdf.font("Helvetica").fontSize(9.5).fillColor(t.critical ? RED : INK)
        .text(`   ${t.fastener}: ${val}${t.critical ? "  — DO NOT EXCEED" : ""}`);
    });
  }
  if (step.tools.length) {
    pdf.moveDown(0.2).fillColor(MUTE).font("Helvetica").fontSize(9)
      .text(`Tools: ${step.tools.join(", ")}`);
  }
  (step.warnings || []).forEach((w) =>
    pdf.fillColor(MUTE).fontSize(9).text(`! ${w}`)
  );
  pdf.moveDown(0.7);
});

ensure(60);
pdf.strokeColor("#cccccc").moveTo(54, pdf.y).lineTo(558, pdf.y).stroke();
pdf.moveDown(0.3).fillColor(MUTE).fontSize(8.5)
  .text(doc.meta.torqueFooter)
  .text(`Support: ${doc.meta.support.email} · ${doc.meta.support.url}`);

pdf.end();
console.log("wrote", out);
