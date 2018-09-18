const assert = require("assert");
const path = require("path");
const qunit = require("../lib/index");

describe("qunit-coverage", function qunitCoverageTests() {
	this.timeout(15000);

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

	it("Should handle absolute path to test file", done => {
		qunit(path.join(__dirname, "fixtures", "passing.html"), {
			verbose: false,
			coverage: false,
		}).then(
			result => {
				try {
					assert.deepStrictEqual(result, { pass: true, results: { passed: 10, failed: 0, total: 10 } }, "All tests should pass.");

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
			verbose: true,
			coverage: false,
		}).then(
			result => {
				try {
					assert.deepStrictEqual(result, { pass: false, results: { passed: 10, failed: 3, total: 13 } }, "Three tests should fail.");

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
			verbose: true,
			timeout: 100,
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
