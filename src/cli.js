const sade = require("sade");
const prog = sade("qunit-coverage");
const qunit = require("./index");

prog.version("0.4.0"); // TODO: Want to keep this up to date.

prog
	.command("test <file>", "", { default: true })
	.option("-c, --coverage", "Evaulate Istanbule coverage", true)
	.option("-v, --verbose", "TODO: Description", true)
	.option("-t, --timeout", "TODO: Description", 5000)
	.option("-f, --formats", "TODO: Description", "")
	.option("-o, --output", "TODO: Description", process.cwd(), "cwd")
	// TODO: formats + output
	.describe("TODO: Fill out description")
	.example("TODO: Example")
	.action(async (file, options) => {
		try {
			const formats = options.formats.split(",").filter(format => format);
			const coverage = formats.length && options.coverage ? { output: options.output, formats } : options.coverage;

			console.log(JSON.stringify(coverage, null, 2));

			const results = await qunit(file, { verbose: options.verbose, timeout: options.timeout, coverage });

			process.exit(results.pass ? 0 : 1);
		} catch (ex) {
			process.exit(1);
		}
	});

prog.parse(process.argv);
