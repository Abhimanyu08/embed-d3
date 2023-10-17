import fs from "node:fs/promises";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { createHash } from "crypto";

function extractTextFromHeadingChildren(
	children: ReturnType<typeof fromMarkdown>["children"]
) {
	let text = "";
	for (let child of children) {
		if (child.type === "text") {
			text += child.value;
			continue;
		}
		text += extractTextFromHeadingChildren((child as any).children);
	}
	return text;
}

type Section = { content: string; checksum: string };
class MarkdownEmbeddingSouce {
	fileName: string;

	constructor(fileName = "/") {
		this.fileName = fileName;
	}



	async *[Symbol.asyncIterator]() {
		yield* divideIntoSections(this.fileName);
	}
}
async function* divideIntoSections(fileName: string) {
	const doc = await fs.readFile(`markdown/${fileName}`);
	const tree = fromMarkdown(doc);

	const currentSection: Section = {
		content: "",
		checksum: "",
	};
	for (let child of tree.children) {
		if (child.type === "heading" && child.depth === 1) {
			if (currentSection.content) {
				const checksum = createHash("sha256")
					.update(currentSection.content)
					.digest("base64");
				yield { ...currentSection, checksum };
				currentSection.content = "";
				currentSection.checksum = "";
			}

			currentSection.content += toMarkdown(child);
			continue;
		}

		currentSection.content += toMarkdown(child);
	}
	if (currentSection.content) {
		const checksum = createHash("sha256")
			.update(currentSection.content)
			.digest("base64");
		yield { ...currentSection, checksum };
	}
}


export default MarkdownEmbeddingSouce;
