const path = require("path");
const chalk = require("chalk");
const childProcess = require("child_process");
const phantomjs = require("phantomjs-prebuilt");

const binPath = phantomjs.path;

const phantomjsRunnerDir = path.dirname(
	require.resolve("qunit-phantomjs-runner")
);

module.exports = function executeTestRunner(
	filePath,
	options = {},
	callback = () => {}
) {
	const runner = "./runner.js"; // path.join(phantomjsRunnerDir, "runner-json.js");
	const absolutePath = path.resolve(filePath);
	const isAbsolutePath = absolutePath.indexOf(filePath) !== -1;
	const childArgs = [];

	// TODO: Refactor block and implement other runners
	/* if (options.verbose) {
		runner = path.join(phantomjsRunnerDir, "runner-list.js");
	} else if (options.customRunner) {
		// A custom phantomjs runner can be used to have more control
		// over pahntomjs configuration or to customize phantomjs hooks.
		runner = options.customRunner;
	} */

	if (options["phantomjs-options"] && options["phantomjs-options"].length) {
		childArgs.push(options["phantomjs-options"]);
	}

	childArgs.push(
		path.join(__dirname, runner),
		isAbsolutePath ? "file:///" + absolutePath.replace(/\\/g, "/") : filePath
	);

	childArgs.push(options.timeout || 5);

	childArgs.push(JSON.stringify(options.page || {}));

	if (options.coverageLocation) {
		childArgs.push(path.resolve(options.coverageLocation));
	}

	const process = childProcess.execFile(
		binPath,
		childArgs,
		(err, stdout, stderr) => {
			let out;
			let result;
			let message;
			let output;

			console.log("Testing", chalk.blue(path.relative(__dirname, filePath)));

			if (stdout) {
				try {
					stdout.trim().split("\n").forEach(line => {
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
};
