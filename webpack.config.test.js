const path = require("path");

module.exports = {
	entry: {
		passing: "./test/passing.js",
		failing: "./test/failing.js"
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.join(__dirname, "src"), path.join(__dirname, "test")],
				use: "babel-loader"
			}
		]
	}
};
