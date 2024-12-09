import nodemailer from "nodemailer";
import config from "../../../config";
import fs from "fs";
import path from "path";

// Function to get the file based on UDS ID
const getFilePathByUdsId = (udsId: string): string | null => {
  const uploadDir = path.join(__dirname, "../EventRegistration/uploads");

  // Read all files in the uploads folder
  const files = fs.readdirSync(uploadDir);

  // Find a file that matches the UDS ID pattern
  const matchedFile = files.find((file) => {
    const [fileUdsId] = file.split("_"); // Split the filename by "_", and take the first part (UDS ID)
    return fileUdsId === udsId && file.endsWith(".pdf"); // Check if the UDS ID matches and it's a PDF
  });

  if (matchedFile) {
    // Return the full path of the matched file
    return path.join(uploadDir, matchedFile);
  }

  // If no file is found, return null
  return null;
};

// Updated sendEmail function with dynamic file path based on UDS ID
const sendEmail = async (
  email: string,
  subject: string,
  html: string,
  teamId: string
) => {
  // Get the file path based on UDS ID
  const filePath = getFilePathByUdsId(teamId);

  if (!filePath) {
    console.log("No PDF found for the given UDS ID:", teamId);
    return; // Stop execution if no file is found
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.password,
    },
  });

  // Read the file as a buffer
  const fileBuffer = fs.readFileSync(filePath); // Synchronously read the file

  const info = await transporter.sendMail({
    from: '"Dulles United Association"<noreply@dullesunited.com>', // sender address
    to: email, // list of receivers
    subject, // Subject line
    html, // HTML body content
    attachments: [
      {
        filename: path.basename(filePath), // Use the original file name
        content: fileBuffer, // Pass the file as a buffer
        contentType: "application/pdf", // Set the content type (application/pdf for PDFs)
      },
    ],
  });

  console.log("Message sent: %s", info.messageId);
  return;
};

export default sendEmail;
