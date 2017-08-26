const path = require("path");

module.exports = {
	entry: "./test/passing.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "passing.js",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.join(__dirname, "src"), path.join(__dirname, "test")],
				use: "babel-loader",
			},
		],
	},
};
