/* global QUnit, window, __coverage__ */

const chalk = require("chalk");
const istanbul = require("istanbul");
const path = require("path");
const puppeteer = require("puppeteer");
const _ = require("lodash");

const { getBranchCoverage, getFunctionCoverage, getStatementCoverage } = require("./coverage-parser");

const spreadObjectIf = (condition, element) => (condition ? element : {});

const defaults = {
	timeout: 10000,
	formats: [],
	output: process.cwd(),
	verbose: false,
};

const qunitChromeRunner = (
	filePath,
	{ coverage = { output: defaults.output, formats: defaults.formats }, verbose = defaults.verbose, timeout = defaults.timeout } = {}
) => {
	const fixturePath = `file:///${path.join(path.isAbsolute(filePath) ? "" : process.cwd(), filePath).replace(/\\/g, "/")}`;
	const log = (...val) => {
		if (verbose) {
			console.log(...val);
		}
	};

	//	options:
	//		timeout
	//		verbose
	//		`coverage: { output: "...", formats: ["json", ...] }` OR `coverage: false`

	return new Promise((resolve, reject) => {
		(async () => {
			// Setting our timeout in case everything below takes too long
			setTimeout(() => {
				log();
				log(chalk.red("Timeout exceeded."));
				log();

				reject(new Error("Timeout exceeded"));
			}, timeout || defaults.timeout);

			log("Testing", chalk.magenta(fixturePath));

			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			const failures = [];

			await page.exposeFunction("logAssertion", async response => {
				// Don't log if the test passed or it's a todo test
				if (!response.result && !response.todo) {
					failures.push(response);
				}
			});

			await page.exposeFunction("report", async response => {
				let coverageReport = {};

				if (coverage) {
					const coverageResults = await page.evaluate(() => __coverage__);
					const collector = new istanbul.Collector();
					const reporter = new istanbul.Reporter(false, coverage.output || defaults.output);
					const formats = coverage.formats || defaults.formats;

					if (verbose && !formats.includes("text-summary")) {
						formats.push("text-summary");
					}

					coverageReport = {
						...coverageReport,
						branch: getBranchCoverage(coverageResults),
						function: getFunctionCoverage(coverageResults),
						statement: getStatementCoverage(coverageResults),
					};

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

				// Group our failures by module / test
				const grouped = _.forIn(_.groupBy(failures, failure => failure.module), (val, key, obj) => {
					obj[key] = _.groupBy(val, failure => failure.name);
				});

				// Loop through each module
				_.forIn(grouped, (val, key, obj) => {
					const hasModule = !!key;

					if (hasModule) {
						log(key);
					}

					// Loop through each test
					_.forIn(val, (tests, name) => {
						const indent = hasModule ? "  " : "";

						log(indent + name);

						// Print each failure
						tests.forEach(({ message, expected, actual }) => {
							log(chalk.red(indent + `  \u2717 ${message ? `${chalk.gray(message)}` : "Test failure"}`));

							if (!_.isUndefined(actual)) {
								log(`${indent}      expected: ${expected}, actual: ${actual}`);
							}
						});

						log();
					});
				});

				log(chalk.blue(`Took ${response.runtime}ms to run ${response.total} tests. ${response.passed} passed, ${response.failed} failed.`));

				await browser.close();

				resolve({
					pass: !response.failed,
					results: _.omit(
						{
							...response,
						},
						"runtime"
					),
					...spreadObjectIf(coverage, { coverage: coverageReport }),
				});
			});

			await page.on("load", async () => {
				const qunitMissing = await page.evaluate(() => typeof QUnit === "undefined" || !QUnit);

				if (qunitMissing) {
					log();
					log(chalk.red("Unable to find the QUnit object."));
					log();

					reject(new Error("Unable to find the QUnit object"));
				}

				await page.evaluate(() => {
					QUnit.done(window.report);
					QUnit.log(window.logAssertion);
				});
			});

			// Navigate to our test file
			try {
				await page.goto(fixturePath);
			} catch (ex) {
				reject(new Error("Failed to open the test file."));
			}
		})();
	});
};

module.exports = qunitChromeRunner;
