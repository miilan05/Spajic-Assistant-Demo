const path = require("path");

module.exports = {
    mode: "development",
    entry: "./dev/script.js",
    output: {
        filename: "script.js",
        path: path.resolve(__dirname, "public"),
    },
    watchOptions: {
        ignored: ["**/public", "**/node_modules"],
    },
    devServer: {
        port: 8080,
        static: "./public",
        hot: true,
    },
    module: {
        rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
    },
};
