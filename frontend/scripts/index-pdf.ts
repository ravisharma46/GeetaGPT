/**
 * Script to index the Bhagavad Gita PDF into Upstash Vector
 * Run with: npx tsx scripts/index-pdf.ts
 * 
 * Required environment variables:
 * - UPSTASH_VECTOR_REST_URL
 * - UPSTASH_VECTOR_REST_TOKEN
 */

import { Index } from "@upstash/vector";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";


// Load environment variables
dotenv.config({ path: ".env.local" });

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// Initialize Upstash Vector with built-in embeddings
const vectorIndex = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

function splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;
        const chunk = text.slice(start, end);

        // Only add non-empty chunks
        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim());
        }

        start = end - overlap;
    }

    return chunks;
}

async function extractTextFromPDF(pdfPath: string): Promise<{ text: string; numPages: number }> {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = new Uint8Array(dataBuffer);

    const pdf = await getDocument({ data }).promise;
    const numPages = pdf.numPages;

    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
        fullText += pageText + "\n";
    }

    return { text: fullText, numPages };
}

async function indexPDF(pdfPath: string) {
    console.log("📚 Starting PDF indexing with Upstash built-in embeddings...\n");

    // Read PDF
    console.log(`📖 Reading PDF from: ${pdfPath}`);
    const { text, numPages } = await extractTextFromPDF(pdfPath);

    console.log(`   Total pages: ${numPages}`);
    console.log(`   Total characters: ${text.length}\n`);

    // Split into chunks
    console.log("✂️  Splitting into chunks...");
    const chunks = splitIntoChunks(text, CHUNK_SIZE, CHUNK_OVERLAP);
    console.log(`   Created ${chunks.length} chunks\n`);

    // Clear existing index
    console.log("🗑️  Clearing existing vectors...");
    try {
        await vectorIndex.reset();
        console.log("   Index cleared\n");
    } catch (e) {
        console.log("   Index is already empty or doesn't exist\n");
    }

    // Index chunks - Upstash will generate embeddings automatically!
    console.log("🧠 Uploading to Upstash (embeddings generated automatically)...\n");

    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        // Use Upstash's built-in embedding - just pass 'data' instead of 'vector'
        const vectors = batch.map((chunk, idx) => ({
            id: `chunk-${i + idx}`,
            data: chunk, // Upstash generates embedding from this text!
            metadata: {
                text: chunk,
                chunkIndex: i + idx,
            },
        }));

        await vectorIndex.upsert(vectors);

        const progress = Math.min(i + batchSize, chunks.length);
        const percentage = Math.round((progress / chunks.length) * 100);
        console.log(`   Progress: ${progress}/${chunks.length} chunks (${percentage}%)`);
    }

    console.log("\n✅ Indexing complete!");
    console.log(`   Total vectors in index: ${chunks.length}`);
}

// Main execution
const pdfPath = path.join(__dirname, "..", "..", "backend", "app", "data", "bhagavad_gita.pdf");

if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF not found at: ${pdfPath}`);
    process.exit(1);
}

indexPDF(pdfPath).catch((error) => {
    console.error("❌ Indexing failed:", error);
    process.exit(1);
});
