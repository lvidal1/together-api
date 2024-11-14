const path = require('path');

require('dotenv').config()

const OCR = require("llama-ocr");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

const corsOptions = {
    origin: 'https://together-ocr-ai.netlify.app/',
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions));

// Middleware to parse JSON and base64 data
app.use(bodyParser.json({ limit: "10mb" }));

// POST route to handle image blob
app.post("/upload-image", async (req, res) => {
  const { image } = req.body; // expecting a base64 encoded image
  
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  // Decode the base64 image
  const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
  const imagePath = path.join(__dirname, "uploads", `image_${Date.now()}.jpg`);


  try {
    // Ensure the 'uploads' directory exists
    await fs.promises.mkdir(path.join(__dirname, "uploads"), { recursive: true });

    // Save the image file
    await fs.promises.writeFile(imagePath, base64Data, "base64");

    // Perform another operation after saving the file
    const markdownString = `![Uploaded Image](${imagePath})`;

    console.log("Processing image", imagePath)

    const markdown = await OCR.ocr({
        filePath: imagePath, // path to your image (soon PDF!)
        apiKey: process.env.TOGETHER_API, // Together AI API key
    });

    console.log("Finish data", markdown)

    // Respond to the client
    res.json({ markdown: markdown });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).json({ error: "Failed to save image" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});