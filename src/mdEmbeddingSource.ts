import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'

function extractTextFromHeadingChildren(children: ReturnType<typeof fromMarkdown>["children"]) {
    let text = ""
    for (let child of children) {
        if (child.type === "text") {
            text += child.value
            continue
        }
        text += extractTextFromHeadingChildren((child as any).children)
    }

    return text
}

type Section = { title: string, content: string }
class MarkdownEmbeddingSouce {
    fileName: string
    sections: Section[]

    constructor(fileName = "/") {
        this.fileName = fileName
        this.sections = []
    }

    async load() {
        const doc = (await fs.readFile(`markdown/${this.fileName}`))
        const tree = fromMarkdown(doc)

        const sections: Section[] = []

        const currentSection: Section = { title: "", content: "" }
        for (let child of tree.children) {
            if (child.type === "heading") {
                if (currentSection.title && currentSection.content) {
                    sections.push({ ...currentSection })
                    currentSection.title = ""
                    currentSection.content = ""
                }
                currentSection.title = extractTextFromHeadingChildren(child.children)
                currentSection.content += toMarkdown(child)
                continue
            }

            currentSection.content += toMarkdown(child)
        }
        if (currentSection.title && currentSection.content) {
            sections.push({ ...currentSection })
        }
        this.sections = sections
    }

    *[Symbol.iterator]() {
        yield* this.sections
    }
}

export default MarkdownEmbeddingSouce