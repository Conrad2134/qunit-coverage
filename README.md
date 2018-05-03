# qunit-coverage [![Build Status](https://travis-ci.org/Conrad2134/qunit-coverage.svg?branch=master)](https://travis-ci.org/Conrad2134/qunit-coverage) [![Build status](https://ci.appveyor.com/api/projects/status/inywlnt2my7d7okp/branch/master?svg=true)](https://ci.appveyor.com/project/Conrad2134/qunit-coverage/branch/master)

A QUnit test runner with Istanbul and headless Chrome.

## Prerequisites

You must be using Node >= 6.

This test runner assumes that your code is already instrumented for Istanbul.

## Installing

Via npm:

`npm install qunit-coverage`

## Usage

`qunit-coverage` is currently accessible via its Node API. The function takes a file name and options object, and it returns a promise.

```javascript
const qunit = require("qunit-coverage");

qunit("path-to-file", {
	/* options */
}).then(/* use results */);
```

## API

### qunit(path-to-test-fixture[, options]);

Opens a test fixture in headless Chrome, calls `QUnit.start()`, logs test results to the console, and returns a promise that resolves with a results object. The results object follows the below format:

```
{
	pass: Boolean,
	results: { // As numbers
		passed: Number,
		failed: Number,
		total: Number,
	},
	coverage: { // If coverage was ran, as percentages
		branch: Number,
		function: Number,
		statement: Number,
	},
},
```

#### options.verbose

Type: `Boolean`<br />
Default: `false`

Logs more detailed output to the console.

#### options.timeout

Type: `Number`<br />
Default: `5000`

Will fail and exit the tests if the timeout limit is exceeded.

#### options.puppeteerOptions

Type: `Object`<br />
Default: `{}`

Passes options to `puppeteer.launch()`. For a list of valid options, see the [puppeteer documentation](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions).

#### options.coverage

Type: `Boolean|Object`<br />
Default: `false`

Configuration options for coverage testing. Passing `false` will prevent coverage testing. Passing `true` will log a text summary report to the console _if_ `options.verbose` is `true`.

#### options.coverage.output

Type: `String`<br />
Default: `process.cwd()`

Where to output any coverage reports that Istanbul generates. Defaults to the current working directory.

#### options.coverage.formats

Type: `Array<String>`<br />
Default: `[]`

What formats to output Istanbul coverage reports as. Valid values include `"lcovonly"`, `"json"`, `"html"`, `"text-summary"` and more.

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on working with this project.

## Roadmap

* Allow for a glob file input, or an array of files (or globs)
* Prettier output and more detailed errors / warnings
* Expose a CLI
* Document how to instrument with Istanbul
* Coverage thresholds?

**Inspired by these projects:**

* [node-qunit-phantomjs](https://github.com/jonkemp/node-qunit-phantomjs)
* [node-qunit-phantomjs-istanbul](https://github.com/kmudrick/node-qunit-phantomjs-istanbul)
