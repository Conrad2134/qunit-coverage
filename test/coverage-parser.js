const assert = require("assert");
const parser = require("../src/coverage-parser");

describe("coverage-parser", function coverageParserTests() {
	/* it("getBranchCoverage()", () => {
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

	it("getFunctionCoverage()", () => {
		const coverage50 = { a: { f: { "0": 1, "1": 0 } } };
		const coverage0 = { a: { f: { "0": 0, "1": 0 } } };
		const coverage100 = { a: { f: { "0": 1, "1": 1 } } };
		const coverage33 = { a: { f: { "0": 1, "1": 0, "2": 0 } } };
		const coverageNone = {};

		const actual50 = parser.getFunctionCoverage(coverage50);
		const actual0 = parser.getFunctionCoverage(coverage0);
		const actual100 = parser.getFunctionCoverage(coverage100);
		const actual33 = parser.getFunctionCoverage(coverage33);
		const actualNone = parser.getFunctionCoverage(coverageNone);

		assert.strictEqual(actual50, 50.0, "Function coverage should equal 50%");
		assert.strictEqual(actual0, 0.0, "Function coverage should equal 0%");
		assert.strictEqual(actual100, 100.0, "Function coverage should equal 100%");
		assert.strictEqual(actual33, 33.33, "Function coverage should equal 33.33%");
		assert.strictEqual(actualNone, 0.0, "Function coverage should equal 0%");
	});

	it("getStatementCoverage()", () => {
		const coverage50 = { a: { s: { "0": 1, "1": 0 } } };
		const coverage0 = { a: { s: { "0": 0, "1": 0 } } };
		const coverage100 = { a: { s: { "0": 1, "1": 1 } } };
		const coverage33 = { a: { s: { "0": 1, "1": 0, "2": 0 } } };
		const coverageNone = {};

		const actual50 = parser.getStatementCoverage(coverage50);
		const actual0 = parser.getStatementCoverage(coverage0);
		const actual100 = parser.getStatementCoverage(coverage100);
		const actual33 = parser.getStatementCoverage(coverage33);
		const actualNone = parser.getStatementCoverage(coverageNone);

		assert.strictEqual(actual50, 50.0, "Statement coverage should equal 50%");
		assert.strictEqual(actual0, 0.0, "Statement coverage should equal 0%");
		assert.strictEqual(actual100, 100.0, "Statement coverage should equal 100%");
		assert.strictEqual(actual33, 33.33, "Statement coverage should equal 33.33%");
		assert.strictEqual(actualNone, 0.0, "Statement coverage should equal 0%");
	}); */
});
