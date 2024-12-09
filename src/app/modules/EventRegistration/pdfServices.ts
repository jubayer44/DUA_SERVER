import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import prisma from "../../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

// Define the directory where the PDFs will be saved
const PDF_STORAGE_PATH = path.join(__dirname, "uploads");

if (!fs.existsSync(PDF_STORAGE_PATH)) {
  fs.mkdirSync(PDF_STORAGE_PATH); // Create the uploads folder if it doesn't exist
}

export async function generateAndSavePdf(
  name: string,
  email: string,
  phone: string | null,
  division: any,
  address: string,
  eventName: string,
  amount: string,
  paymentMethod: string,
  teamId: string,
  date: string
): Promise<string> {
  // Path to the existing PDF template
  const templatePath = path.join(__dirname, "uploads/dua_invoice.pdf");
  const existingPdfBytes = fs.readFileSync(templatePath);

  // Generate a unique filename based on the current timestamp
  const timestamp = Date.now();
  const newPdfFileName = `${teamId}_${timestamp}.pdf`;
  const newPdfFilePath = path.join(PDF_STORAGE_PATH, newPdfFileName);

  // Copy the original PDF template to the new file
  fs.writeFileSync(newPdfFilePath, existingPdfBytes);

  // Load the copied PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Get the first page of the document
  const page = pdfDoc.getPages()[0];

  // Replace the placeholder text with actual data by drawing text at known coordinates
  replaceTextOnPage(page, "Date", date, 103, 632);
  replaceTextOnPage(page, "to", name, 62, 578);
  replaceTextOnPage(page, "to", "Email: " + email, 62, 563);
  replaceTextOnPage(page, "to", "Phone: " + phone, 62, 548);
  replaceTextOnPage(page, "to", address, 62, 533);
  replaceTextOnPage(page, "Division", division, 75, 455);
  replaceTextOnPage(page, "Event", eventName, 270, 455);
  replaceTextOnPage(page, "Amount", `$${amount}`, 480, 455);
  replaceTextOnPage(page, "Total", `$${amount}`, 480, 415);
  replaceTextOnPage(page, "Method", paymentMethod, 190, 300);
  // Save the updated PDF to the new file
  const updatedPdfBytes = await pdfDoc.save();

  // Save the modified PDF to disk (overwrite the copied file)
  fs.writeFileSync(newPdfFilePath, updatedPdfBytes);

  // Return the relative link to the PDF
  const pdfUrl = `/uploads/${newPdfFileName}`;
  return pdfUrl;
}

function replaceTextOnPage(
  page: any,
  placeholder: string,
  replacement: string,
  x: number,
  y: number
) {
  if (!replacement || typeof replacement !== "string") {
    console.error(`Invalid replacement value for ${placeholder}:`, replacement);
    replacement = "Invalid"; // Use a default string if replacement is invalid
  }
  page.drawText(replacement, {
    x: x,
    y: y,
    size: 12,
    color: rgb(0, 0, 0), // Black color for the text
  });
}

// Cleanup old PDFs based on additional conditions
async function cleanUpOldFiles() {
  try {
    const files = await fs.promises.readdir(PDF_STORAGE_PATH); // Use promises for async handling

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const oneMonth = 30 * 24 * 60 * 60 * 1000; // 1 month in milliseconds

    // Get all the records from the database once
    const invoices = await prisma.event_Registration.findMany({
      select: {
        teamId: true,
        paymentStatus: true,
      },
    });

    const invoiceMap = invoices.reduce((acc: any, invoice: any) => {
      acc[invoice.teamId] = invoice.paymentStatus;
      return acc;
    }, {});

    for (const file of files) {
      const filePath = path.join(PDF_STORAGE_PATH, file);

      // Skip the original template file
      if (file === "dua_invoice.pdf") {
        continue;
      }

      // Extract teamId from the filename (before the first underscore)
      const getTeamId = file.split("_")[0];

      // Check if we have the invoice in the database for the extracted teamId
      const paymentStatus = invoiceMap[getTeamId];

      // Condition 3: If the teamId doesn't match any record in the database, delete the file
      if (!paymentStatus) {
        await fs.promises.unlink(filePath);
        console.log(
          `Deleted ${file} because no matching record for teamId ${getTeamId} found in the database.`
        );
        continue;
      }

      const stats = await fs.promises.stat(filePath);
      const fileAge = now - stats.mtimeMs;

      // Condition 1: Delete file if older than 24 hours and paymentStatus is 'paid'
      if (fileAge > twentyFourHours && paymentStatus === PaymentStatus.PAID) {
        await fs.promises.unlink(filePath);
        console.log(
          `Deleted ${file} because it's older than 24 hours and the payment is 'paid'`
        );
        continue;
      }

      // Condition 2: Delete file if older than 1 month and paymentStatus is 'unpaid'
      if (fileAge > oneMonth && paymentStatus === PaymentStatus.UNPAID) {
        await fs.promises.unlink(filePath);
        console.log(
          `Deleted ${file} because it's older than 1 month and the payment is 'unpaid'`
        );
      }
    }
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}

// Call cleanup function on server startup or periodically
setInterval(cleanUpOldFiles, 60000 * 5); // Check every 5 minute
