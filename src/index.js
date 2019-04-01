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
	const fixture = path.join(path.isAbsolute(filePath) ? "" : process.cwd(), filePath);
	const fixtureName = path.basename(fixture, ".html");
	const snapshotDir = path.join(path.dirname(fixture), "__snapshots__", fixtureName);

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
				const saveSnapshots = snapshots => {
					fs.ensureDirSync(snapshotDir);

					try {
						Object.entries(snapshots).forEach(([scope, snaps]) => {
							const file = path.join(snapshotDir, scope + ".snap");
							const existing = fs.existsSync(file) ? require(file) : {};
							const snapshotFile = _.extend({}, existing, snaps);

							const str = Object.entries(snapshotFile).reduce((fileStr, [key, value]) => {
								return fileStr + "module.exports[`" + key + "`] = `\n" + value.trim() + "\n`;\n\n";
							}, "");

							fs.writeFileSync(file, str);
						});
					} catch (ex) {
						// TODO: Since this is an experimental feature, still need to figure out logging / error handling.
						console.error(ex);
					}
				};

				await page.exposeFunction("report", async (snapshots, response) => {
					let coverageReport = {};

					if (snapshots) {
						saveSnapshots(snapshots);
					}

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
						await page.exposeFunction("loadSnapshots", async () => {
							await fs.ensureDir(snapshotDir);

							const files = glob.sync(path.join(snapshotDir, "*.snap"));

							try {
								return files.reduce((allSnapshots, file) => {
									const snapshots = require(file) || {};
									const scope = path.basename(file, ".snap");

									const scoped = Object.entries(snapshots).reduce((existing, [key, value]) => {
										return _.extend({}, existing, { [key]: value.trim() });
									}, {});

									return _.extend({}, allSnapshots, { [scope]: scoped });
								}, {});
							} catch (ex) {
								// TODO: Since this is an experimental feature, still need to figure out logging / error handling.
								console.error(ex);
								return {};
							}
						});

						await page.evaluate(async () => {
							const storage = await window.loadSnapshots();

							window.__snapshots__ = {
								storage,
								get(scope, id) {
									const scoped = window.__snapshots__.storage[scope] || {};

									return scoped[id];
								},
								async set(scope, id, snapshot) {
									snapshot = snapshot.trim();
									const group = window.__snapshots__.storage[scope];
									const scoped = Object.assign({}, group, { [id]: snapshot });

									window.__snapshots__.storage[scope] = scoped;
								},
							};

							QUnit.done(response => window.report(window.__snapshots__.storage, response));
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
