/* global QUnit, window, __coverage__ */

const path = require("path");
const chalk = require("chalk");
const istanbul = require("istanbul");
const _ = require("lodash");
const puppeteer = require("puppeteer");

const qunitChromeRunner = (filePath, { coverage = { output: process.cwd(), formats: [] }, verbose = false, timeout = 5000 } = {}) => {
	const log = (...val) => {
		if (verbose) {
			console.log(...val);
		}
	};

	//	options:
	//		timeout
	//		verbose
	//		`coverage: { output: "...", formats: ["json", ...] }` OR `coverage: false` (does it by default to cwd and json)

	return new Promise((resolve, reject) => {
		(async () => {
			// Setting our timeout in case everything below takes too long
			setTimeout(() => {
				log();
				log(chalk.red("Timeout exceeded."));
				log();

				reject(new Error("Timeout exceeded"));
			}, timeout);

			log("Testing", chalk.magenta(path.relative(process.cwd(), filePath)));

			const browser = await puppeteer.launch({
				headless: true
			}); // defaults to true, not needed

			const page = await browser.newPage();

			await page.exposeFunction("report", async response => {
				if (coverage) {
					const coverageResults = await page.evaluate(() => __coverage__);
					const collector = new istanbul.Collector();
					const reporter = new istanbul.Reporter(false, coverage.output);
					const formats = coverage.formats || [];

					if (verbose && !formats.includes("text-summary")) {
						formats.push("text-summary");
					}

					collector.add(coverageResults);

					reporter.addAll(formats);
					reporter.write(collector, true, () => {
						if (!formats.includes("text-summary") || formats.length !== 1) {
							log();
							log(`Coverage written to ${chalk.magenta(coverage.output)}`);
						}
					});
				}

				log();
				log(chalk.blue(`Took ${response.runtime}ms to run ${response.total} tests. ${response.passed} passed, ${response.failed} failed.`));

				await browser.close();

				resolve({
					pass: !response.failed,
					results: _.omit(
						{
							...response
						},
						"runtime"
					)
				});
			});

			await page.on("load", async () => {
				const qunitMissing = await page.evaluate(() => typeof QUnit === "undefined" || !QUnit);

				if (qunitMissing) {
					log();
					log(chalk.red("Unable to find the QUnit object.")); // TODO: message
					log();

					reject(new Error("Unable to find the QUnit object"));
				}

				await page.evaluate(() => {
					QUnit.done(window.report);
				});
			});

			// Navigate to our test file
			await page.goto(`file:///${path.join(process.cwd(), filePath).replace(/\\/g, "/")}`);
		})();
	});
};

module.exports = qunitChromeRunner;
