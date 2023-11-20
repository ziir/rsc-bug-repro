"use strict";

const reactServerregister = require("react-server-dom-webpack/node-register");
reactServerregister();

const babelRegister = require("@babel/register");
babelRegister({
  ignore: [/[\\\/](dist|node_modules)[\\\/]/],
  plugins: ["@babel/transform-modules-commonjs"],
});

require("./server-rsc")();
