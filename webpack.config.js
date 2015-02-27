module.exports = {
	entry: "./js/reactElements.jsx",
	output: {
		path: "./js",
		filename: "main.js"
	},
	module : {
		noparse: [],
		loaders: [
			{ test: /\.jsx$/,
				loaders: ['jsx-loader?harmony'] }
		]
	},
	resolve: {
		modulesDirectories: ['node_modules', 'node_modules/material-ui/node_modules/'],
		alias: {},
		extensions: ['', '.jsx', '.js']
	}
};
