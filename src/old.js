/* OLD INDEX */

/*
		// TODO: Refactor block and implement other runners
		/* if (options.verbose) {
			runner = path.join(phantomjsRunnerDir, "runner-list.js");
		} else if (options.customRunner) {
			// A custom phantomjs runner can be used to have more control
			// over pahntomjs configuration or to customize phantomjs hooks.
			runner = options.customRunner;
		} */
/*
	const process = childProcess.execFile(
		binPath,
		childArgs,
		(err, stdout, stderr) => {
			const collector = new istanbul.Collector();
			const reporter = new istanbul.Reporter(false, options.coverageLocation);

			let out;
			let result;
			let message;
			let output;

			console.log("Testing", chalk.blue(path.relative(__dirname, filePath)));

			if (stdout) {
				try {
					stdout
						.trim()
						.split("\n")
						.forEach(line => {
							try {
								out = JSON.parse(line.trim());
								result = out.result;

								message = `Took ${result.runtime}ms to run ${result.total} tests. ${result.passed} passed, ${result.failed} failed.`;

								output = chalk[result.failed > 0 ? "red" : "green"](message);

								console.log(output);

								if (out.exceptions) {
									for (test in out.exceptions) {
										console.log();
										console.log(
											chalk.red("Test failed") + ":",
											chalk.red(test) + ":"
										);
										console.log();
										console.log(out.exceptions[test].join("\n  "));
									}
								}
							} catch (ex) {
								console.log(line.trim());
							}
						});
				} catch (ex) {
					this.emit("error", new Error(ex));
				}

				// If coverage exists, write other reports
				if (options.coverageLocation) {
					const coverage = JSON.parse(
						fs.readFileSync(
							path.join(options.coverageLocation, "coverage.json"),
							"utf8"
						)
					);

					collector.add(coverage);
					reporter.addAll(["lcovonly", "html", "text-summary"]);
					reporter.write(collector, true, () => {
						console.log(`Coverage written to ${options.coverageLocation}`);
					});
				}
			}

			if (stderr) {
				console.log(stderr);
			}

			if (err) {
				console.log(err);
			}
		}
	);

	process.on("close", callback);
*/

/* OLD RUNNER */

/*global phantom:false, require:false, console:false, window:false, QUnit:false */

/*
(function() {
	"use strict";

	var url,
		page,
		timeout,
		coverageLocation,
		args = require("system").args,
		fs = require("fs");

	// arg[0]: scriptName, args[1...]: arguments
	if (args.length < 3) {
		console.error(
			"Usage:\n  phantomjs [phantom arguments] runner.js [url-of-your-qunit-testsuite] [timeout-in-seconds] [page-properties] [coverageLocation]"
		);
		exit(1);
	}

	url = args[1];
	timeout = args[2];

	page = require("webpage").create();

	try {
		var pageProperties = JSON.parse(args[3]);

		if (pageProperties) {
			for (var prop in pageProperties) {
				if (pageProperties.hasOwnProperty(prop)) {
					page[prop] = pageProperties[prop];
				}
			}
		}
	} catch (e) {
		console.error('Error parsing "' + args[3] + '": ' + e);
	}

	if (args[4] !== undefined) {
		coverageLocation = args[4];
	}

	// Route `console.log()` calls from within the Page context to the main Phantom context (i.e. current `this`)
	page.onConsoleMessage = function(msg) {
		console.log(msg);
	};

	page.onInitialized = function() {
		page.evaluate(addLogging);
	};

	page.onCallback = function(message) {
		var result, failed;

		if (message) {
			if (message.name === "QUnit.done") {
				result = message.data;
				failed = !result || !result.total || result.failed;

				if (!result.total) {
					console.error(
						"No tests were executed. Are you loading tests asynchronously?"
					);
				}

				exit(failed ? 1 : 0);
			}
		}
	};

	page.open(url, function(status) {
		if (status !== "success") {
			console.error("Unable to access network: " + status);
			exit(1);
		} else {
			// Cannot do this verification with the 'DOMContentLoaded' handler because it
			// will be too late to attach it if a page does not have any script tags.
			var qunitMissing = page.evaluate(function() {
				return typeof QUnit === "undefined" || !QUnit;
			});
			if (qunitMissing) {
				console.error("The `QUnit` object is not present on this page.");
				exit(1);
			}

			// Set a default timeout value if the user does not provide one
			if (typeof timeout === "undefined") {
				timeout = 5;
			}

			// Set a timeout on the test running, otherwise tests with async problems will hang forever
			setTimeout(function() {
				console.error(
					"The specified timeout of " +
						timeout +
						" seconds has expired. Aborting..."
				);
				exit(1);
			}, timeout * 1000);

			// Do nothing... the callback mechanism will handle everything!
		}
	});

	function addLogging() {
		window.document.addEventListener(
			"DOMContentLoaded",
			function() {
				QUnit.log(function(details) {
					var response;

					console.log((details.result ? "✔ " : "✖ ") + details.message);

					if (!details.result) {
						response = details.message || "";

						if (typeof details.expected !== "undefined") {
							if (response) {
								response += ", ";
							}

							response +=
								"expected: " +
								details.expected +
								", but was: " +
								details.actual;
						}

						if (details.source) {
							response += "\n" + details.source;
						}

						console.log("    Failed assertion: " + response);
					}
				});

				QUnit.moduleStart(function(details) {
					if (details.name) {
						console.log("\n" + details.name);
					}
				});

				QUnit.testStart(function(result) {
					console.log("\n" + result.name);
				});

				QUnit.done(function(result) {
					console.log(
						"\n" +
							"Took " +
							result.runtime +
							"ms to run " +
							result.total +
							" tests. " +
							result.passed +
							" passed, " +
							result.failed +
							" failed."
					);

					if (typeof window.callPhantom === "function") {
						window.callPhantom({
							name: "QUnit.done",
							data: result,
						});
					}
				});
			},
			false
		);
	}

	function exit(code) {
		if (page) {
			if (coverageLocation) {
				var coverage = page.evaluate(function() {
					return __coverage__;
				});

				fs.write(coverageLocation, JSON.stringify(coverage), "w");
			}
			page.close();
		}
		setTimeout(function() {
			phantom.exit(code);
		}, 0);
	}
})();
*/
