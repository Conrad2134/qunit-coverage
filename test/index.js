const assert = require("assert");
const qunit = require("../lib/index");

describe("qunit-coverage", function qunitCoverageTests() {
	this.timeout(10000);

	it("Tests should pass", done => {
		qunit("test/fixtures/passing.html", {
			verbose: true,
			coverage: true,
		}).then(
			result => {
				try {
					assert.deepStrictEqual(
						result,
						{ pass: true, results: { passed: 10, failed: 0, total: 10 }, coverage: { branch: 50, function: 100, statement: 80 } },
						"All tests should pass."
					);

					done();
				} catch (ex) {
					done(ex);
				}
			},
			err => {
				done(err);
			}
		);
	});

	it("Tests should fail", done => {
		qunit("test/fixtures/failing.html", {
			verbose: false,
			coverage: false,
		}).then(
			result => {
				try {
					assert.deepStrictEqual(result, { pass: false, results: { passed: 10, failed: 1, total: 11 } }, "One test should fail.");

					done();
				} catch (ex) {
					done(ex);
				}
			},
			err => {
				done(err);
			}
		);
	});

	it("Timeout should fail the test runner", done => {
		qunit("test/fixtures/passing.html", {
			verbose: false,
			timeout: 1,
		}).catch(err => {
			assert.strictEqual(err.message, "Timeout exceeded", "Error should be thrown");

			done();
		});
	});

	it("Missing fixture should fail the test runner", done => {
		qunit("test/fixtures/missing.html", {
			verbose: false,
		}).catch(err => {
			assert.strictEqual(err.message, "Failed to open the test file.", "Error should be thrown");

			done();
		});
	});
});
