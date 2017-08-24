const assert = require("assert");
const stripAnsi = require("strip-ansi");
const qunit = require("../src/index");

const out = process.stdout.write.bind(process.stdout);

describe("qunit-coverage", function qunitCoverage() {
	this.timeout(5000);

	it("basic tests should pass", cb => {
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
});
