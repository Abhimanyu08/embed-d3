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

type Section = { title: string; content: string; checksum: string };
class MarkdownEmbeddingSouce {
	fileName: string;

	constructor(fileName = "/") {
		this.fileName = fileName;
	}

	async *divideIntoSections() {
		const doc = await fs.readFile(`markdown/${this.fileName}`);
		const tree = fromMarkdown(doc);

		const currentSection: Section = {
			title: "",
			content: "",
			checksum: "",
		};
		for (let child of tree.children) {
			if (child.type === "heading") {
				if (currentSection.title && currentSection.content) {
					const checksum = createHash("sha256")
						.update(currentSection.content)
						.digest("base64");
					yield { ...currentSection, checksum };
					currentSection.title = "";
					currentSection.content = "";
					currentSection.checksum = "";
				}
				currentSection.title = extractTextFromHeadingChildren(
					child.children
				);
				currentSection.content += toMarkdown(child);
				continue;
			}

			currentSection.content += toMarkdown(child);
		}
		if (currentSection.title && currentSection.content) {
			const checksum = createHash("sha256")
				.update(currentSection.content)
				.digest("base64");
			yield { ...currentSection, checksum };
		}
	}

	async *[Symbol.asyncIterator]() {
		yield* this.divideIntoSections();
	}
}

export default MarkdownEmbeddingSouce;
