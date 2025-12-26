import { Index } from "@upstash/vector";
import OpenAI from "openai";

// Initialize Upstash Vector with built-in embeddings
const vectorIndex = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Initialize OpenAI client for OpenRouter (LLM only)
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `You are GeetaGPT, a spiritual AI assistant grounded strictly in the Bhagavad Gita.
Your mission is to answer questions using ONLY the following context from the Bhagavad Gita.

Context:
{context}

STRICT RULES:
1. Answer strictly based on the provided context.
2. If the answer is not in the context, YOU MUST SAY EXACTLY: "The Bhagavad Gita does not explicitly address this in the provided text."
3. Do not use outside knowledge or make assumptions.
4. Do not hallucinate verses or meanings.
5. Maintain a calm, respectful, and spiritual tone.
6. Start your answer by citing the Chapter and Verse numbers if available in the context (e.g., "In Chapter 2, Verse 47...").
7. Ensure your answer is concise and directly addresses the user's question.`;

async function retrieveContext(query: string, topK: number = 5): Promise<string> {
    // Use Upstash's built-in embedding - just pass the text directly!
    const results = await vectorIndex.query({
        data: query, // Upstash generates embedding automatically
        topK,
        includeMetadata: true,
    });

    // Combine the text from retrieved chunks
    const contextChunks = results
        .filter((r) => r.metadata?.text)
        .map((r) => r.metadata!.text as string);

    return contextChunks.join("\n\n---\n\n");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== "string") {
            return new Response(JSON.stringify({ error: "Message is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Retrieve relevant context from the Bhagavad Gita
        const context = await retrieveContext(message);

        if (!context) {
            return new Response(
                JSON.stringify({ error: "No relevant context found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Build the prompt with context
        const systemPrompt = SYSTEM_PROMPT.replace("{context}", context);

        // Create streaming response from OpenRouter
        const response = await openai.chat.completions.create({
            model: "tngtech/deepseek-r1t2-chimera:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
            stream: true,
            temperature: 0.3,
        });

        // Create a ReadableStream to stream the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to process request" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
