const _ = require("lodash");
const $ = require("lodash/fp");

const calculatePercentage = (covered, total) => {
	const percentage = _.round(covered / total * 100, 2);

	return _.isNaN(percentage) ? 0 : percentage;
};

const getCoverage = (type, coverage) => {
	const results = _.chain(coverage)
		.values()
		.map($.property(type))
		.map(_.values)
		.flattenDeep()
		.reduce(
			(result, coverageType) => {
				return { total: ++result.total, covered: coverageType ? ++result.covered : result.covered };
			},
			{ total: 0, covered: 0 }
		)
		.value();

	return calculatePercentage(results.covered, results.total);
};

const getBranchCoverage = coverage => getCoverage("b", coverage);
const getFunctionCoverage = coverage => getCoverage("f", coverage);
const getStatementCoverage = coverage => getCoverage("s", coverage);

module.exports = {
	getBranchCoverage,
	getFunctionCoverage,
	getStatementCoverage,
};
