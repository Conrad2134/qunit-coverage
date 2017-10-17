const path = require("path");
const chalk = require("chalk");
const istanbul = require("istanbul");
const fs = require("fs");
const puppeteer = require("puppeteer");

module.exports = function executeTestRunner(
	filePath,
	options = {},
	callback = () => {}
) {
		const runner = "./runner.js";
		const absolutePath = path.resolve(filePath);
		const isAbsolutePath = absolutePath.indexOf(filePath) !== -1;
		const childArgs = [];

		//	options:
		//		`coverage: { output: "...", formats: ["json", ...] }` OR `coverage: false` (does it by default to cwd and json)
		//		verbose
		//		chrome-options (similar to phantomjs-options)
		//		timeout
		//		page?

		/* console.log(
		"file:///" + path.join(process.cwd(), filePath).replace(/\\/g, "/") // TODO: format
	); */

		// Setting our timeout in case everything below takes too long
		setTimeout(() => {
			console.log();
			console.log(chalk.red("TIMEOUT, SUCKER"));
			console.log();
			process.exit(1);
		}, options.timeout || 5000);

		(async () => {
			console.log("Testing", chalk.magenta(path.relative(process.cwd(), filePath)));

			const browser = await puppeteer.launch({ headless: true }); // defaults to true, not needed
			const page = await browser.newPage();

			await page.exposeFunction("report", async response => {
				const coverage = await page.evaluate(() => __coverage__);

				console.dir(response);

				const collector = new istanbul.Collector();
				const reporter = new istanbul.Reporter(false, options.output);

				collector.add(coverage);

				reporter.addAll(["lcovonly", "html", "text-summary", "json"]);
				reporter.write(collector, true, () => {
					console.log();
					console.log(`Coverage written to ${chalk.magenta(options.output)}`);
				});

				console.log();
				console.log("Took " + response.runtime + "ms to run " + response.total + " tests. " + response.passed + " passed, " + response.failed + " failed.");

				await browser.close();
			});

			await page.on("load", async () => {
				const qunitMissing = await page.evaluate(() => {
					return typeof QUnit === "undefined" || !QUnit;
				});

				if (qunitMissing) {
					console.log();
					console.log(chalk.red("QUnit seems to be missing... :/")); // TODO: message
					console.log();

					process.exit(1);
				}

				await page.evaluate(() => {
					QUnit.done(window.report);
				});
			});

			// Navigate to our test file
			await page.goto("file:///" + path
						.join(process.cwd(), filePath)
						.replace(/\\/, "/"));
		})();
	};
