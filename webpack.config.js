module.exports = {
    mode: 'development', // This is the default mode that doesn’t minify
    devtool: 'source-map',
    entry: './src/script.js',
    output: {
        path: __dirname + '/dist', // Output folder
        filename: 'main.js', // Output file
        clean: true, // Clean dist folder before each build
    },
    // Your other Webpack settings
  };