const path = require("path");
const externals = require("webpack-node-externals");

module.exports = {
	target: "node",
	entry: "./src/index.js",
	externals: externals(),
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.js",
		libraryTarget: "umd"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.join(__dirname, "src")],
				use: "babel-loader"
			}
		]
	}
};
