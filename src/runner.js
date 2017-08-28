/* global phantom:false, require:false, console:false, window:false, QUnit:false */

(function () {
	let url,
		page,
		timeout,
		coverageLocation,
		args = require("system").args,
		fs = require("fs");

	// arg[0]: scriptName, args[1...]: arguments
	if (args.length < 3) {
		console.error(
			"Usage:\n  phantomjs [phantom arguments] runner.js [url-of-your-qunit-testsuite] [timeout-in-seconds] [page-properties] [coverageLocation]",
		);
		exit(1);
	}

	url = args[1];
	timeout = args[2];

	page = require("webpage").create();

	try {
		const pageProperties = JSON.parse(args[3]);

		if (pageProperties) {
			for (const prop in pageProperties) {
				if (pageProperties.hasOwnProperty(prop)) {
					page[prop] = pageProperties[prop];
				}
			}
		}
	} catch (e) {
		console.error(`Error parsing "${args[3]}": ${e}`);
	}

	if (args[4] !== undefined) {
		coverageLocation = args[4];
	}

	// Route `console.log()` calls from within the Page context to the main Phantom context (i.e. current `this`)
	page.onConsoleMessage = function (msg) {
		console.log(msg);
	};

	page.onInitialized = function () {
		page.evaluate(addLogging);
	};

	page.onCallback = function (message) {
		let result,
			failed;

		if (message) {
			if (message.name === "QUnit.done") {
				result = message.data;
				failed = !result || !result.total || result.failed;

				if (!result.total) {
					console.error(
						"No tests were executed. Are you loading tests asynchronously?",
					);
				}

				exit(failed ? 1 : 0);
			}
		}
	};

	page.open(url, status => {
		if (status !== "success") {
			console.error(`Unable to access network: ${status}`);
			exit(1);
		} else {
			// Cannot do this verification with the 'DOMContentLoaded' handler because it
			// will be too late to attach it if a page does not have any script tags.
			const qunitMissing = page.evaluate(() => typeof QUnit === "undefined" || !QUnit);
			if (qunitMissing) {
				console.error("The `QUnit` object is not present on this page.");
				exit(1);
			}

			// Set a default timeout value if the user does not provide one
			if (typeof timeout === "undefined") {
				timeout = 5;
			}

			// Set a timeout on the test running, otherwise tests with async problems will hang forever
			setTimeout(() => {
				console.error(
					`The specified timeout of ${
						timeout
					} seconds has expired. Aborting...`,
				);
				exit(1);
			}, timeout * 1000);

			// Do nothing... the callback mechanism will handle everything!
		}
	});

	function addLogging() {
		window.document.addEventListener(
			"DOMContentLoaded",
			() => {
				QUnit.log(details => {
					let response;

					console.log((details.result ? "✔ " : "✖ ") + details.message);

					if (!details.result) {
						response = details.message || "";

						if (typeof details.expected !== "undefined") {
							if (response) {
								response += ", ";
							}

							response +=
								`expected: ${
									details.expected
								}, but was: ${
									details.actual}`;
						}

						if (details.source) {
							response += `\n${details.source}`;
						}

						console.log(`    Failed assertion: ${response}`);
					}
				});

				QUnit.moduleStart(details => {
					if (details.name) {
						console.log(`\n${details.name}`);
					}
				});

				QUnit.testStart(result => {
					console.log(`\n${result.name}`);
				});

				QUnit.done(result => {
					console.log(
						`${"\n" +
							"Took "}${
							result.runtime
						}ms to run ${
							result.total
						} tests. ${
							result.passed
						} passed, ${
							result.failed
						} failed.`,
					);

					if (typeof window.callPhantom === "function") {
						window.callPhantom({
							name: "QUnit.done",
							data: result,
						});
					}
				});
			},
			false,
		);
	}

	function exit(code) {
		if (page) {
			if (coverageLocation) {
				const coverage = page.evaluate(() => __coverage__);
				console.log(`Writing coverage to ${coverageLocation}`);
				fs.write(coverageLocation, JSON.stringify(coverage), "w");
			}
			page.close();
		}
		setTimeout(() => {
			phantom.exit(code);
		}, 0);
	}
}());
