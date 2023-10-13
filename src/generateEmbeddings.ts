import fs from "fs";
import MarkdownEmbeddingSouce from "./mdEmbeddingSource.js";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types.js";

import { config } from 'dotenv'


const keys = config().parsed;
// Define the folder name you want to check
const folderName = "markdown";
const openai = new OpenAI({
	apiKey: keys!.OPENAI_API_KEY,
});
const supabase = createClient<Database>(keys!.SUPABASE_URL, keys!.SUPABASE_KEY);

// Check if the folder exists in the current working directory

function* markdownFilesToSource() {
	if (fs.existsSync(folderName) && fs.statSync(folderName).isDirectory()) {
		// List all the filenames in the folder
		const fileNames = fs.readdirSync(folderName);

		if (fileNames.length > 0) {
			for (let filename of fileNames) {
				yield new MarkdownEmbeddingSouce(filename);
			}
		} else {
			throw new Error("No files in markdown folder");
		}
	} else {
		throw new Error(
			"Folder named 'markdown' doesn't exist in current directory"
		);
	}
}

async function generateEmbeddings() {
	for (let source of markdownFilesToSource()) {
		for await (let { content, checksum } of source) {
			try {

				const { data } = await supabase.from("documents").select("*").match({ checksum })
				if (data?.length && data.length > 0) {
					// already embedded this section
					return
				}
				const input = content.replace(/\n/g, " ");
				const embeddingResp = await openai.embeddings.create({
					model: "text-embedding-ada-002",
					input,
				});
				const embedding = embeddingResp.data[0].embedding;

				await supabase.from("documents").insert({
					content: content,
					embedding,
					checksum
				});
			} catch (e) {
				console.error(e);
			}
		}
	}
}

export default generateEmbeddings