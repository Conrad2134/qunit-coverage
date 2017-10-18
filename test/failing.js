const { test } = require("qunitjs");
const { isEven, multiply } = require("../src/functions");

test("isEven()", function(assert) {
	assert.ok(isEven(0), "Zero is an even number");
	assert.ok(isEven(2), "So is two");
	assert.ok(isEven(-4), "So is negative four");
	assert.ok(!isEven(1), "One is not an even number");
	assert.ok(!isEven(-7), "Neither is negative seven");
});

test("multiply()", function(assert) {
	assert.ok(multiply(0, 1) === 0, "Zero times one is zero");
	assert.ok(multiply(2, 2) === 4, "Two times two is four");
	assert.ok(multiply(1, 3) === 3, "One times three is three");
	assert.ok(multiply(10, 5) === 50, "Five times ten is fifty");
	assert.ok(multiply(10, 10) === 100, "Ten times ten is one hundred");
	assert.ok(multiply(10, 10) === 101, "Ten times ten is one hundred one");
});
