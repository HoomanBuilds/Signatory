import { NextRequest, NextResponse } from "next/server";
import { addToKnowledgeBase } from "@/lib/vectordb";
import { getAuthenticatedAddress } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // Verify SIWE Authentication
        const authenticatedAddress = await getAuthenticatedAddress();
        
        if (!authenticatedAddress) {
            return NextResponse.json(
                { error: "Authentication required. Please sign in with your wallet." },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const knowledgeBaseId = formData.get("knowledgeBaseId") as string;
        const files = formData.getAll("files") as File[];

        if (!knowledgeBaseId || files.length === 0) {
            return NextResponse.json(
                { error: "Missing knowledgeBaseId or files" },
                { status: 400 }
            );
        }

        const documents: string[] = [];

        for (const file of files) {
            let text = "";

            if (file.type === "application/pdf") {
                const buffer = Buffer.from(await file.arrayBuffer());

                // @ts-ignore
                const PDFParser = (await import("pdf2json")).default;
                const parser = new PDFParser(null, true); 

                text = await new Promise((resolve, reject) => {
                    parser.on("pdfParser_dataError", (errData: any) =>
                        reject(new Error(errData.parserError))
                    );
                    parser.on("pdfParser_dataReady", (pdfData: any) => {
                        const rawText = parser.getRawTextContent();
                        resolve(rawText);
                    });

                    parser.parseBuffer(buffer);
                });
            } else if (
                file.type === "text/plain" ||
                file.type === "text/markdown" ||
                file.name.endsWith(".md") ||
                file.name.endsWith(".txt")
            ) {
                text = await file.text();
            } else {
                console.warn(`Unsupported file type: ${file.type}`);
                continue;
            }


            const chunks = chunkText(text, 1000, 100);
            documents.push(...chunks);
        }

        if (documents.length === 0) {
            return NextResponse.json(
                { error: "No valid text content found in files" },
                { status: 400 }
            );
        }

        const result = await addToKnowledgeBase(knowledgeBaseId, documents);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to index documents" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            documentCount: documents.length,
        });
    } catch (error: any) {
        console.error("Error uploading knowledge base:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Helper function to chunk text into smaller pieces
 * @param text The text to chunk
 * @param maxLength Maximum length of each chunk
 * @param overlap Number of characters to overlap between chunks
 */
function chunkText(text: string, maxLength: number, overlap: number): string[] {
    if (!text || text.length === 0) return [];
    if (text.length <= maxLength) return [text];

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = startIndex + maxLength;

        // If we're not at the end of the text, try to break at a natural boundary
        if (endIndex < text.length) {
            const searchWindow = text.substring(
                Math.max(startIndex, endIndex - Math.floor(maxLength * 0.3)),
                endIndex
            );

            // Prioritize sentence breaks
            const sentenceBreak = Math.max(
                searchWindow.lastIndexOf(". "),
                searchWindow.lastIndexOf("! "),
                searchWindow.lastIndexOf("? "),
                searchWindow.lastIndexOf(".\n"),
                searchWindow.lastIndexOf("!\n"),
                searchWindow.lastIndexOf("?\n")
            );

            if (sentenceBreak !== -1) {
                // Found a sentence break
                endIndex =
                    endIndex -
                    Math.floor(maxLength * 0.3) +
                    sentenceBreak +
                    1; // Include the punctuation
            } else {
                // Fallback to other delimiters
                const otherBreak = Math.max(
                    searchWindow.lastIndexOf("\n"),
                    searchWindow.lastIndexOf(", "),
                    searchWindow.lastIndexOf(" ")
                );

                if (otherBreak !== -1) {
                    endIndex =
                        endIndex - Math.floor(maxLength * 0.3) + otherBreak + 1;
                }
            }
        }

        // Ensure we make progress
        if (endIndex <= startIndex) {
            endIndex = Math.min(startIndex + maxLength, text.length);
        }

        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        // Move start index for next chunk, accounting for overlap
        // But don't overlap if we're at the very end
        if (endIndex >= text.length) {
            break;
        }

        startIndex = Math.max(startIndex + 1, endIndex - overlap);
    }

    return chunks;
}
