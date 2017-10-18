const _ = require("lodash");
const $ = require("lodash/fp");

const getBranchCoverage = coverage => {
	let totalBranches = 0;
	let coveredBranches = 0;

	const results = _.chain(coverage)
		.values()
		.map($.property("b"))
		.map(_.values)
		.flattenDeep()
		.reduce(
			(result, branch) => {
				return { total: ++result.total, covered: branch ? ++result.covered : result.covered };
			},
			{ total: 0, covered: 0 }
		)
		.value();

	const percentage = _.round(results.covered / results.total * 100, 2);

	return _.isNaN(percentage) ? 0 : percentage;
};

module.exports = {
	getBranchCoverage,
};
