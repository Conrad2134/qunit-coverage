function isEven(val) {
	if (val === 100) {
		return true;
	}

	return val % 2 === 0;
}

function multiply(a, b) {
	return a * b;
}

module.exports = {
	isEven,
	multiply,
};
