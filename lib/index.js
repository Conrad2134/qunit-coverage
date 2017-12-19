(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("chalk"), require("istanbul"), require("path"), require("puppeteer"), require("lodash/fp"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "chalk", "istanbul", "path", "puppeteer", "lodash/fp"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("lodash"), require("chalk"), require("istanbul"), require("path"), require("puppeteer"), require("lodash/fp")) : factory(root["lodash"], root["chalk"], root["istanbul"], root["path"], root["puppeteer"], root["lodash/fp"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* global QUnit, window, __coverage__ */

const chalk = __webpack_require__(2);
const istanbul = __webpack_require__(3);
const path = __webpack_require__(4);
const puppeteer = __webpack_require__(5);
const _ = __webpack_require__(0);

var _require = __webpack_require__(6);

const getBranchCoverage = _require.getBranchCoverage,
      getFunctionCoverage = _require.getFunctionCoverage,
      getStatementCoverage = _require.getStatementCoverage;


const spreadObjectIf = (condition, element) => condition ? element : {};

const defaults = {
	timeout: 10000,
	formats: [],
	output: process.cwd(),
	verbose: false
};

const qunitChromeRunner = (filePath, { coverage = { output: defaults.output, formats: defaults.formats }, verbose = defaults.verbose, timeout = defaults.timeout } = {}) => {
	const fixturePath = `file:///${path.join(path.isAbsolute(filePath) ? "" : process.cwd(), filePath).replace(/\\/g, "/")}`;
	const log = (...val) => {
		if (verbose) {
			console.log(...val);
		}
	};

	//	options:
	//		timeout
	//		verbose
	//		`coverage: { output: "...", formats: ["json", ...] }` OR `coverage: false`

	return new Promise((resolve, reject) => {
		_asyncToGenerator(function* () {
			// Setting our timeout in case everything below takes too long
			const timer = setTimeout(function () {
				log();
				log(chalk.red("Timeout exceeded."));
				log();

				reject(new Error("Timeout exceeded"));
			}, timeout || defaults.timeout);

			log("Testing", chalk.magenta(fixturePath));

			const browser = yield puppeteer.launch();
			const page = yield browser.newPage();
			const failures = [];

			yield page.exposeFunction("logAssertion", (() => {
				var _ref2 = _asyncToGenerator(function* (response) {
					// Don't log if the test passed or it's a todo test
					if (!response.result && !response.todo) {
						failures.push(response);
					}
				});

				return function (_x) {
					return _ref2.apply(this, arguments);
				};
			})());

			yield page.exposeFunction("report", (() => {
				var _ref3 = _asyncToGenerator(function* (response) {
					let coverageReport = {};

					if (coverage) {
						const coverageResults = yield page.evaluate(function () {
							return __coverage__;
						});
						const collector = new istanbul.Collector();
						const reporter = new istanbul.Reporter(false, coverage.output || defaults.output);
						const formats = coverage.formats || defaults.formats;

						if (verbose && !formats.includes("text-summary")) {
							formats.push("text-summary");
						}

						coverageReport = _extends({}, coverageReport, {
							branch: getBranchCoverage(coverageResults),
							function: getFunctionCoverage(coverageResults),
							statement: getStatementCoverage(coverageResults)
						});

						collector.add(coverageResults);

						reporter.addAll(formats);
						reporter.write(collector, true, function () {
							if (!formats.includes("text-summary") || formats.length !== 1) {
								log();
								log(`Coverage written to ${chalk.magenta(coverage.output)}`);
							}
						});
					}

					log();

					// Group our failures by module / test
					const grouped = _.forIn(_.groupBy(failures, function (failure) {
						return failure.module;
					}), function (val, key, obj) {
						// eslint-disable-next-line no-param-reassign
						obj[key] = _.groupBy(val, function (failure) {
							return failure.name;
						});
					});

					// Loop through each module
					_.forIn(grouped, function (val, key) {
						const hasModule = !!key;

						if (hasModule) {
							log(key);
						}

						// Loop through each test
						_.forIn(val, function (tests, name) {
							const indent = hasModule ? "  " : "";

							log(indent + name);

							// Print each failure
							tests.forEach(function ({ message, expected, actual }) {
								log(chalk.red(`${indent}  \u2717 ${message ? `${chalk.gray(message)}` : "Test failure"}`));

								if (!_.isUndefined(actual)) {
									log(`${indent}      expected: ${expected}, actual: ${actual}`);
								}
							});

							log();
						});
					});

					log(chalk.blue(`Took ${response.runtime}ms to run ${response.total} tests. ${response.passed} passed, ${response.failed} failed.`));

					yield browser.close();

					// Get rid of our timeout timer because we're done
					clearTimeout(timer);

					resolve(_extends({
						pass: !response.failed,
						results: _.omit(_extends({}, response), "runtime")
					}, spreadObjectIf(coverage, { coverage: coverageReport })));
				});

				return function (_x2) {
					return _ref3.apply(this, arguments);
				};
			})());

			yield page.on("load", _asyncToGenerator(function* () {
				const qunitMissing = yield page.evaluate(function () {
					return typeof QUnit === "undefined" || !QUnit;
				});

				if (qunitMissing) {
					log();
					log(chalk.red("Unable to find the QUnit object."));
					log();

					reject(new Error("Unable to find the QUnit object"));
				}

				yield page.evaluate(function () {
					QUnit.done(window.report);
					QUnit.log(window.logAssertion);
				});
			}));

			// Navigate to our test file
			try {
				yield page.goto(fixturePath);
			} catch (ex) {
				reject(new Error("Failed to open the test file."));
			}
		})();
	});
};

module.exports = qunitChromeRunner;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("istanbul");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("puppeteer");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _ = __webpack_require__(0);
const $ = __webpack_require__(7);

const calculatePercentage = (covered, total) => {
	const percentage = _.round(covered / total / 0.01, 2);

	return _.isNaN(percentage) ? 0 : percentage;
};

const getCoverage = (type, coverage) => {
	const results = _.chain(coverage).values().map($.property(type)).map(_.values).flattenDeep().reduce((result, coverageType) => ({ total: ++result.total, covered: coverageType ? ++result.covered : result.covered }), { total: 0, covered: 0 }) // eslint-disable-line no-param-reassign
	.value();

	return calculatePercentage(results.covered, results.total);
};

const getBranchCoverage = coverage => getCoverage("b", coverage);
const getFunctionCoverage = coverage => getCoverage("f", coverage);
const getStatementCoverage = coverage => getCoverage("s", coverage);

module.exports = {
	getBranchCoverage,
	getFunctionCoverage,
	getStatementCoverage
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("lodash/fp");

/***/ })
/******/ ]);
});