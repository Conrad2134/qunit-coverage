const assert = require("assert");
const stripAnsi = require("strip-ansi");
const qunit = require("../src/index");

const out = process.stdout.write.bind(process.stdout);

describe("qunit-coverage", function qunitCoverage() {
	this.timeout(5000);

	it("tests should pass", cb => {
		qunit("test/fixtures/passing.html");

		process.stdout.write = str => {
			str = stripAnsi(str);

			if (/10 passed, 0 failed./.test(str)) {
				assert(true);
				process.stdout.write = out;
				cb();
			}
		};
	});

	it("tests should fail", cb => {
		qunit("test/fixtures/failing.html");

		process.stdout.write = str => {
			str = stripAnsi(str);

			if (/10 passed, 1 failed./.test(str)) {
				assert(true);
				process.stdout.write = out;
				cb();
			}
		};
	});

	it("tests should not be affected by console.log", cb => {
		qunit("test/fixtures/console-log.html");

		process.stdout.write = str => {
			str = stripAnsi(str);

			if (/10 passed, 0 failed./.test(str)) {
				assert(true);
				process.stdout.write = out;
				cb();
			}
		};
	});

	it("tests should pass with options", cb => {
		qunit("test/fixtures/passing.html", {
			"phantomjs-options": ["--ssl-protocol=any"],
		});

		process.stdout.write = str => {
			str = stripAnsi(str);

			if (/10 passed, 0 failed./.test(str)) {
				assert(true);
				process.stdout.write = out;
				cb();
			}
		};
	});

	it("tests should pass with custom viewport", cb => {
		qunit("test/fixtures/custom-viewport.html", {
			page: {
				viewportSize: { width: 1280, height: 800 },
			},
		});

		process.stdout.write = str => {
			str = stripAnsi(str);

			if (/2 passed, 0 failed./.test(str)) {
				assert(true);
				process.stdout.write = out;
				cb();
			}
		};
	});

	it("tests should time out", cb => {
		qunit("test/fixtures/async.html", { timeout: 1 });

		process.stdout.write = str => {
			if (/timeout of 1 second/.test(str)) {
				assert(true);
				process.stdout.write = out;
				cb();
			}
		};
	});
});
