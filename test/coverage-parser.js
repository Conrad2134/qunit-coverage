const assert = require("assert");
const parser = require("../src/coverage-parser");

describe("coverage-parser", function coverageParserTests() {
	it("getBranchCoverage()", () => {
		const coverage50 = { a: { b: { "0": [0, 1] } } };
		const coverage0 = { a: { b: { "0": [0, 0] } } };
		const coverage100 = { a: { b: { "0": [1, 1], "1": [1, 1] } } };
		const coverage33 = { a: { b: { "0": [1, 1], "1": [0, 0], "2": [0, 0] } } };
		const coverageNone = {};

		const actual50 = parser.getBranchCoverage(coverage50);
		const actual0 = parser.getBranchCoverage(coverage0);
		const actual100 = parser.getBranchCoverage(coverage100);
		const actual33 = parser.getBranchCoverage(coverage33);
		const actualNone = parser.getBranchCoverage(coverageNone);

		assert.strictEqual(actual50, 50.0, "Branch coverage should equal 50%");
		assert.strictEqual(actual0, 0.0, "Branch coverage should equal 0%");
		assert.strictEqual(actual100, 100.0, "Branch coverage should equal 100%");
		assert.strictEqual(actual33, 33.33, "Branch coverage should equal 33.33%");
		assert.strictEqual(actualNone, 0.0, "Branch coverage should equal 0%");
	});
});
