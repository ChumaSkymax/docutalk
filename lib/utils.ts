import { TextSegment } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_VOICE, voiceOptions } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Serialize Mongoose documents to plain JSON objects (strips ObjectId, Date, etc.)
export const serializeData = <T>(data: T): T =>
  JSON.parse(JSON.stringify(data));

// Auto generate slug
export function generateSlug(text: string): string {
  return text
    .replace(/\.[^/.]+$/, "") // Remove file extension (.pdf, .txt, etc.)
    .toLowerCase() // Convert to lowercase
    .trim() // Remove whitespace from both ends
    .replace(/[^\w\s-]/g, "") // Remove special characters (keep letters, numbers, spaces, hyphens)
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Escape regex special characters to prevent ReDoS attacks
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Splits text content into segments for MongoDB storage and search
export const splitIntoSegments = (
  text: string,
  segmentSize: number = 500, // Maximum words per segment
  overlapSize: number = 50, // Words to overlap between segments for context
): TextSegment[] => {
  // Validate parameters to prevent infinite loops
  if (segmentSize <= 0) {
    throw new Error("segmentSize must be greater than 0");
  }
  if (overlapSize < 0 || overlapSize >= segmentSize) {
    throw new Error("overlapSize must be >= 0 and < segmentSize");
  }

  const words = text.split(/\s+/).filter((word) => word.length > 0); //SPLIT TEXT INTO WORDS -convert text to array of words eg ["Hello", "world", "AI"]
  const segments: TextSegment[] = []; //Create an empty array to store the segments

  let segmentIndex = 0; //Initialize the segment index
  let startIndex = 0; //Initialize the start index

  while (startIndex < words.length) {
    //Loop through the words
    const endIndex = Math.min(startIndex + segmentSize, words.length); //Calculate the end index
    const segmentWords = words.slice(startIndex, endIndex); //Slice the words to create a segment
    const segmentText = segmentWords.join(" "); //Join the words to create a segment

    segments.push({
      text: segmentText,
      segmentIndex,
      wordCount: segmentWords.length,
    }); //Push the segment to the segments array

    segmentIndex++; //Increment the segment index

    if (endIndex >= words.length) break; //Break the loop if the end index is greater than or equal to the number of words
    startIndex = endIndex - overlapSize; //Set the start index to the end index minus the overlap size
  }

  return segments;
};

// Get voice data by persona key or voice ID
export const getVoice = (persona?: string) => {
  if (!persona) return voiceOptions[DEFAULT_VOICE];

  // Find by voice ID
  const voiceEntry = Object.values(voiceOptions).find((v) => v.id === persona);
  if (voiceEntry) return voiceEntry;

  // Find by key
  const voiceByKey = voiceOptions[persona as keyof typeof voiceOptions];
  if (voiceByKey) return voiceByKey;

  // Default fallback
  return voiceOptions[DEFAULT_VOICE];
};

// Format duration in seconds to MM:SS format
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export async function parsePDFFile(file: File) {
  try {
    const pdfjsLib = await import("pdfjs-dist"); //Import the pdfjs-dist library to parse the PDF file

    if (typeof window !== "undefined") {
      //Check if the code is running in a browser environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer(); //Read the file as an array buffer

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }); //Load the PDF document
    const pdfDocument = await loadingTask.promise; //Wait for the PDF document to load

    // Render first page as cover image
    const firstPage = await pdfDocument.getPage(1); //Get the first page of the PDF document
    const viewport = firstPage.getViewport({ scale: 2 }); // 2x scale for better quality

    const canvas = document.createElement("canvas"); //Create a canvas element to render the PDF page
    canvas.width = viewport.width; //Set the width of the canvas
    canvas.height = viewport.height; //Set the height of the canvas
    const context = canvas.getContext("2d"); //Get the 2D rendering context for the canvas

    if (!context) {
      //Check if the context is valid
      throw new Error("Could not get canvas context"); //Throw an error if the context is not valid
    }

    await firstPage.render({
      canvas,
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert canvas to data URL
    const coverDataURL = canvas.toDataURL("image/png");

    // Extract text from all pages
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      //Loop through all the pages of the PDF document
      const page = await pdfDocument.getPage(pageNum); //Get the current page
      const textContent = await page.getTextContent(); //Get the text content of the current page
      const pageText = textContent.items
        .filter((item) => "str" in item) //Filter out items that do not have the str property
        .map((item) => (item as { str: string }).str) //Map the items to their str property
        .join(" "); //Join the items to create a segment
      fullText += pageText + "\n"; //Add the segment to the full text
    }

    const segments = splitIntoSegments(fullText); //Split the full text into segments

    await pdfDocument.destroy(); //Destroy the PDF document

    return {
      content: segments,
      cover: coverDataURL,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(
      `Failed to parse PDF file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
