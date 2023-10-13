import fs from 'fs';
import MarkdownEmbeddingSouce from './mdEmbeddingSource.js';

// Define the folder name you want to check
const folderName = 'markdown';

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
        }
    }
}

generateEmbeddings()