import fs from 'fs';
import MarkdownEmbeddingSouce from './mdEmbeddingSource.js';
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types.js';

// Define the folder name you want to check
const folderName = 'markdown';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

// Check if the folder exists in the current working directory



async function generateEmbeddings() {
    const sources: MarkdownEmbeddingSouce[] = []
    if (fs.existsSync(folderName) && fs.statSync(folderName).isDirectory()) {
        // List all the filenames in the folder
        const fileNames = fs.readdirSync(folderName);

        if (fileNames.length > 0) {
            fileNames.forEach((filename) => {
                sources.push(new MarkdownEmbeddingSouce(filename))
            });
        } else {
            throw new Error("No files in markdown folder")
        }
    }
    else {

        throw new Error("Folder named 'markdown' doesn't exist in current directory")
    }

    for (let source of sources.slice(0, 1)) {
        await source.load()
        for (let { content } of source) {
            const input = content.replace(/\n/g, ' ')
            const embeddingResp = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input
            })
            debugger
            const embedding = embeddingResp.data[0].embedding

            await supabase.from("documents").insert({
                content: content,
                embedding
            })

        }
    }
}

generateEmbeddings()