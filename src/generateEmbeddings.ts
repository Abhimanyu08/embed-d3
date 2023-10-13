import fs from 'fs';
import MarkdownEmbeddingSouce from './mdEmbeddingSource.js';
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types.js';

// Define the folder name you want to check
const OPENAI_API_KEY = "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"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXJtanJrdWt6bmdwbGVqYmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcxMTQyMjUsImV4cCI6MjAxMjY5MDIyNX0.YzfX52kBbahDY1uW1Pvh75g3xWJ2PVn0Q-8172_8pvo"
const SUPABASE_URL = "https://xnyrmjrkukzngplejbcx.supabase.co"
const folderName = 'markdown';
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
})

const supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_KEY!)

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