import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";

async function getAlld3Links() {
	// Launch a headless browser
	const browser = await puppeteer.launch({ headless: "new" });

	// Open a new page
	const page = await browser.newPage();

	// Navigate to the D3.js documentation website
	await page.goto("https://d3js.org/what-is-d3");

	// You would need to interact with the website to access specific documentation pages
	// and scrape their content. This might involve clicking links, following navigation, etc.

	// Once on the documentation page, you can extract the content using DOM manipulation.
	const linkString = await page.evaluate(() => {
		const links: string[] = [];
		const aTags = document.querySelector("aside")?.querySelectorAll("a");
		aTags?.forEach((a) => links.push(a.getAttribute("href")!));
		return links.join("\n");
	});

	// Save the content to a file

	const allD3Links = linkString.split("\n");
	// Close the browser
	await browser.close();
	return allD3Links;
}

async function d3LinkToMarkdown(
	link: string,
	browser: Browser,
	turndown: TurndownService
) {
	// Open a new page
	const page = await browser.newPage();

	// Navigate to the D3.js documentation website
	await page.goto("https://d3js.org" + link);

	// You would need to interact with the website to access specific documentation pages
	// and scrape their content. This might involve clicking links, following navigation, etc.

	// Once on the documentation page, you can extract the content using DOM manipulation.
	const content = await page.evaluate(() => {
		const docElem = document
			.querySelector(`div.vp-doc`)
			?.querySelector(":first-child");
		return docElem?.innerHTML;
	});

	// Save the content to a file
	const dom: JSDOM = new JSDOM(content);

	const document = dom.window.document;

	// Select and remove all SVG elements
	const svgElements = document.querySelectorAll("svg");
	svgElements.forEach((svgElement) => svgElement.remove());

	// Serialize the modified DOM back to HTML
	const modifiedHtml = dom.serialize();

	const markdown = turndown.turndown(modifiedHtml);
	fs.writeFileSync(`markdown${link}.md`, markdown);
}

async function convertAllD3pagesToMarkdown() {
	const allPageLinks = await getAlld3Links();

	const browser = await puppeteer.launch({ headless: "new" });

	const turndown = new TurndownService();
	for (let link of allPageLinks.slice(0, 3)) {
		await d3LinkToMarkdown(link, browser, turndown);
	}

	browser.close();
}

export default convertAllD3pagesToMarkdown()