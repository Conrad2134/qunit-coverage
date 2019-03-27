/* global QUnit, window, __coverage__ */

const chalk = require("chalk");
const istanbul = require("istanbul");
const path = require("path");
const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs-extra");
const glob = require("glob");

const { getBranchCoverage, getFunctionCoverage, getStatementCoverage } = require("./coverage-parser");

const spreadObjectIf = (condition, element) => (condition ? element : {});

const defaults = {
	timeout: 20000,
	formats: [],
	output: process.cwd(),
	puppeteerOptions: {},
	verbose: false,
};

const qunitChromeRunner = (
	filePath,
	{
		coverage = { output: defaults.output, formats: defaults.formats },
		verbose = defaults.verbose,
		timeout = defaults.timeout,
		puppeteerOptions = defaults.puppeteerOptions,
	} = {},
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
	//		puppeteerOptions: { /* options to pass to puppeteer */ }
	//		`coverage: { output: "...", formats: ["json", ...] }` OR `coverage: false`

	return new Promise((resolve, reject) => {
		(async () => {
			const closeBrowser = async (browser, rejection) => {
				try {
					browser.on("disconnected", () => {
						setTimeout(() => {
							const { pid } = browser.process();
							log(`Browser disconnected... PID: ${pid}`);
							try {
								process.kill(pid);
							} catch (ex) {
								if (ex) {
									log(`Failed to kill process: ${ex}`);
								}
							} finally {
								if (rejection) {
									reject(rejection);
								}
							}
						}, 100);
					});

					browser.disconnect();
				} catch (ex) {
					// Silently handle, for now.
				}
			};

			log("Testing", chalk.magenta(fixturePath));

			const browser = await puppeteer.launch(puppeteerOptions);
			const page = await browser.newPage();
			const failures = [];

			// Setting our timeout in case everything below takes too long
			const timer = setTimeout(() => {
				log();
				log(chalk.red("Timeout exceeded."));
				log();

				closeBrowser(browser, new Error("Timeout exceeded"));
			}, timeout || defaults.timeout);

			try {
				await page.exposeFunction("logAssertion", async response => {
					// Don't log if the test passed or it's a todo test
					if (!response.result && !response.todo) {
						failures.push(response);
					}
				});
			} catch (ex) {
				// Silently handle, for now.
			}

			try {
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

						coverageReport = Object.assign({}, coverageReport, {
							branch: getBranchCoverage(coverageResults),
							function: getFunctionCoverage(coverageResults),
							statement: getStatementCoverage(coverageResults),
						});

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
						// eslint-disable-next-line no-param-reassign
						obj[key] = _.groupBy(val, failure => failure.name);
					});

					// Loop through each module
					_.forIn(grouped, (val, key) => {
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
								log(chalk.red(`${indent}  \u2717 ${message ? `${chalk.gray(message)}` : "Test failure"}`));

								if (!_.isUndefined(actual)) {
									log(`${indent}      expected: ${expected}, actual: ${actual}`);
								}
							});

							log();
						});
					});

					log(chalk.blue(`Took ${response.runtime}ms to run ${response.total} tests. ${response.passed} passed, ${response.failed} failed.`));

					try {
						await closeBrowser(browser);

						// Get rid of our timeout timer because we're done
						clearTimeout(timer);

						resolve(
							Object.assign(
								{},
								{ pass: !response.failed, results: _.omit(Object.assign({}, response), "runtime") },
								spreadObjectIf(coverage, {
									coverage: coverageReport,
								}),
							),
						);
					} catch (ex) {
						// This might happen if the timeout exceeded and we already closed.
					}
				});
			} catch (ex) {
				// silently handle, for now
			}

			try {
				page.on("load", async () => {
					try {
						const qunitMissing = await page.evaluate(() => typeof QUnit === "undefined" || !QUnit);

						if (qunitMissing) {
							log();
							log(chalk.red("Unable to find the QUnit object."));
							log();

							await closeBrowser(browser, new Error("Unable to find the QUnit object"));
						}
					} catch (ex) {
						// silently handle, for now
					}

					try {
						const fixture = path.join(path.isAbsolute(filePath) ? "" : process.cwd(), filePath);
						const fixtureName = path.basename(fixture, ".html");
						const snapshotDir = path.join(path.dirname(fixture), "__snapshot__", fixtureName);

						await page.exposeFunction("loadSnapshots", async () => {
							await fs.ensureDir(snapshotDir);

							const files = await glob.sync(path.join(snapshotDir, "*.snapshot"));

							return files.reduce((snapshots, file) => {
								return { ...snapshots, [path.basename(file, ".snapshot")]: fs.readFileSync(file, "utf-8") };
							}, {});
						});

						await page.exposeFunction("setSnapshot", async (id, snapshot) => {
							await fs.ensureDir(snapshotDir);
							await fs.writeFile(path.join(snapshotDir, id + ".snapshot"), snapshot);
						});

						await page.evaluate(async () => {
							const storage = await window.loadSnapshots();

							window.__snapshot__ = {
								storage,
								get(id) {
									return window.__snapshot__.storage[id];
								},
								async set(id, snapshot) {
									window.__snapshot__.storage[id] = snapshot;
									await window.setSnapshot(id, snapshot);
								},
							};

							QUnit.done(window.report);
							QUnit.log(window.logAssertion);
							QUnit.start();
						});
					} catch (ex) {
						// silently handle, for now.
					}
				});
			} catch (ex) {
				// silently handle, for now
			}

			// Navigate to our test file
			try {
				await page.goto(fixturePath);
			} catch (ex) {
				log();
				log(chalk.red("Failed to open the test file."));
				log();

				await closeBrowser(browser, new Error("Failed to open the test file."));
			}
		})();
	});
};

module.exports = qunitChromeRunner;
