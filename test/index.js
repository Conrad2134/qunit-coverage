const assert = require("assert");
const qunit = require("../src/index");

describe("qunit-coverage", function qunitCoverageTests() {
	this.timeout(5000);

	it("Tests should pass", done => {
		qunit("test/fixtures/passing.html", {
			verbose: true,
			coverage: true
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

	it("Timeout should fail the test runner", done => {
		qunit("test/fixtures/passing.html", {
			verbose: false,
			timeout: 1
		}).catch(err => {
			assert.strictEqual(err.message, "Timeout exceeded", "Error should be thrown");

			done();
		});
	});

	/* 	it("tests should fail", done => {
		qunit("test/fixtures/failing.html").then(result => {
			try {
				assert.deepStrictEqual(
					result,
					{ pass: false, results: { passed: 10, failed: 1, total: 11 } },
					"One test should fail."
				);

				done();
			} catch (ex) {
				done(ex);
			}
		});
	}); */
});
