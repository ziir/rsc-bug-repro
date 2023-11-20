"use strict";

const babelRegister = require("@babel/register");
babelRegister({
  ignore: [/[\\\/](dist|node_modules)[\\\/]/],
  plugins: ["@babel/transform-modules-commonjs"],
});

require("./server-ssr")();
