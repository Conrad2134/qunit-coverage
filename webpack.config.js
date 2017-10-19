const path = require("path");
const externals = require("webpack-node-externals")();

module.exports = {
	externals,
	target: "node",
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "lib"),
		filename: "index.js",
		libraryTarget: "umd",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.join(__dirname, "src")],
				use: "babel-loader",
			},
		],
	},
};
