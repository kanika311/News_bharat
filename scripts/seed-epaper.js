const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Minimal valid PDF text
function createSamplePdf(titleText, dateText) {
  const streamContent = `BT /F1 24 Tf 60 720 Td (SWAR MEDIA DAINIK E-PAPER) Tj ET BT /F1 14 Tf 60 690 Td (${titleText}) Tj ET BT /F1 12 Tf 60 660 Td (Date: ${dateText} | Lucknow & Sultanpur Edition) Tj ET BT /F1 11 Tf 60 620 Td (Nishpakshata, Satya aur Jan Sarokar ki Buland Aawaz) Tj ET BT /F1 10 Tf 60 580 Td (Welcome to the Digital Newspaper edition of Swar Media.) Tj ET`;
  const streamLength = Buffer.byteLength(streamContent);

  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n";
  const obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  const pos1 = header.length;
  const pos2 = pos1 + obj1.length;
  const pos3 = pos2 + obj2.length;
  const pos4 = pos3 + obj3.length;
  const pos5 = pos4 + obj4.length;
  const xrefPos = pos5 + obj5.length;

  const pad = (n) => String(n).padStart(10, "0");
  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(pos1)} 00000 n \n${pad(pos2)} 00000 n \n${pad(pos3)} 00000 n \n${pad(pos4)} 00000 n \n${pad(pos5)} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer);
}

const todayPdfPath = path.join(uploadsDir, "swar-media-today.pdf");
fs.writeFileSync(todayPdfPath, createSamplePdf("Today's Main Edition", "5 November 2026"));

const prevPdfPath1 = path.join(uploadsDir, "swar-media-nov4.pdf");
fs.writeFileSync(prevPdfPath1, createSamplePdf("State & City Special Edition", "4 November 2026"));

const prevPdfPath2 = path.join(uploadsDir, "swar-media-nov3.pdf");
fs.writeFileSync(prevPdfPath2, createSamplePdf("National & Business Edition", "3 November 2026"));

console.log("Created sample PDF files in public/uploads/");

// Connect to MongoDB and seed EPaper collection
const { connectDB } = require("../lib/db");
const EPaper = require("../server/models/EPaper");

async function seedEPapers() {
  await connectDB();

  const count = await EPaper.countDocuments();
  if (count === 0) {
    console.log("Seeding initial e-papers...");

    const papers = [
      {
        title: "दैनिक स्वर मीडिया - 5 नवम्बर 2026",
        edition: "लखनऊ मुख्य संस्करण",
        date: new Date("2026-11-05T00:00:00.000Z"),
        dateStr: "2026-11-05",
        pdfUrl: "/uploads/swar-media-today.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
        pageCount: 8,
        fileSize: "2.4 MB",
        isActive: true,
        views: 142,
        downloads: 28,
      },
      {
        title: "दैनिक स्वर मीडिया - 4 नवम्बर 2026",
        edition: "लखनऊ मुख्य संस्करण",
        date: new Date("2026-11-04T00:00:00.000Z"),
        dateStr: "2026-11-04",
        pdfUrl: "/uploads/swar-media-nov4.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80",
        pageCount: 8,
        fileSize: "2.2 MB",
        isActive: true,
        views: 310,
        downloads: 65,
      },
      {
        title: "दैनिक स्वर मीडिया - 3 नवम्बर 2026",
        edition: "सुल्तानपुर संस्करण",
        date: new Date("2026-11-03T00:00:00.000Z"),
        dateStr: "2026-11-03",
        pdfUrl: "/uploads/swar-media-nov3.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
        pageCount: 6,
        fileSize: "1.9 MB",
        isActive: true,
        views: 280,
        downloads: 51,
      },
    ];

    await EPaper.insertMany(papers);
    console.log("Successfully seeded 3 e-paper editions!");
  } else {
    console.log(`Database already has ${count} e-paper editions.`);
  }

  process.exit(0);
}

seedEPapers().catch((err) => {
  console.error(err);
  process.exit(1);
});
