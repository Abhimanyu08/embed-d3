import { convertAllD3pagesToMarkdown } from "./crawlD3docs.js";
import generateEmbeddings from "./generateEmbeddings.js";
async function main() {

    await convertAllD3pagesToMarkdown()
    await generateEmbeddings()

}
main()