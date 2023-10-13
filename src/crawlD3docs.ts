import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";

async function getAllLinks(landingLink: string) {
	// Launch a headless browser
	const browser = await puppeteer.launch({ headless: "new" });

	// Open a new page
	const page = await browser.newPage();

	// Navigate to the D3.js documentation website
	await page.goto(landingLink);

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

async function linkToMarkdown(
	origin: string,
	link: string,
	browser: Browser,
	turndown: TurndownService
) {
	// Open a new page
	const page = await browser.newPage();

	// Navigate to the D3.js documentation website
	await page.goto(origin + link);

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
	if (!fs.existsSync("markdown")) {
		fs.mkdirSync("markdown")
	}
	fs.writeFileSync(`markdown${link}.md`, markdown);
}

const getAlld3Links = () => getAllLinks("https://d3js.org/what-is-d3")
const getAllPlotLinks = () => getAllLinks("https://observablehq.com/plot/what-is-plot")


export async function convertAllD3pagesToMarkdown() {
	const allPageLinks = await getAlld3Links();

	const browser = await puppeteer.launch({ headless: "new" });

	const turndown = new TurndownService();
	for (let link of allPageLinks) {
		await linkToMarkdown("https://d3js.org", link, browser, turndown);
	}

	browser.close();
}
export async function convertAllPlotpagesToMarkdown() {
	const allPageLinks = await getAllPlotLinks();

	const browser = await puppeteer.launch({ headless: "new" });

	const turndown = new TurndownService();
	for (let link of allPageLinks) {
		await linkToMarkdown("https://observablehq.com/plot/", link, browser, turndown);

	}

	browser.close();
}
