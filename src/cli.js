#!/usr/bin/env node

const path = require("path");
const sade = require("sade");
const qunit = require("./index");

const program = sade("qunit-coverage");

program.version("0.4.0"); // TODO: How to keep this up to date?

program
	.command("test <file>", "", { default: true })
	.option("-c, --coverage", "Evaulate Istanbul coverage", true)
	.option("-v, --verbose", "Perform additional logging", true)
	.option("-t, --timeout", "Set a timeout to fail the process after", 5000)
	.option("-o, --output", "Set an output directory for additional coverage format outputs", ".")
	.option("-f, --formats", "Output test coverage in different formats")
	.option("-p, --puppeteer-options", "Passes options to puppeteer on launch")
	.describe("Runs the QUnit test runner for the given fixture.")
	.example("qunit-coverage test/fixture.html")
	.example("qunit-coverage test/fixture.html -o coverage -f json,html")
	.example("qunit-coverage test test/fixture.html")
	.action(async (file, options) => {
		try {
			const formats = options.formats ? options.formats.split(",").filter(format => format) : [];
			const coverage = formats.length && options.coverage ? { output: path.resolve(options.output), formats } : options.coverage;

			let puppeteerOptions = {};

			try {
				puppeteerOptions = JSON.parse(options.p || "{}");
			} catch (ex) {
				console.log();
				console.log(ex.message);
				console.log();
			}

			const results = await qunit(file, { verbose: options.verbose, timeout: options.timeout, coverage, puppeteerOptions });

			process.exit(results.pass ? 0 : 1);
		} catch (ex) {
			// TODO: Log the exception?
			process.exit(1);
		}
	});

program.parse(process.argv);
