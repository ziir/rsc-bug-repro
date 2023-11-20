"use strict";

const path = require("node:path");
const { readFileSync } = require("node:fs");

const Fastify = require("fastify");

const {
  renderToPipeableStream,
} = require("react-server-dom-webpack/server.node");

const { App } = require("../src/app/app.js");

const MANIFEST = readFileSync(
  path.resolve(__dirname, "../dist/react-client-manifest.json"),
  "utf8"
);
const MODULE_MAP = JSON.parse(MANIFEST);

const HTTP_HOST = process.env.HOST ?? "localhost";
const HTTP_PORT = (process.env.PORT ? Number(process.env.PORT) : 3000) + 1;
const NODE_ENV = process.env.NODE_ENV || "development";

const LOGGER_OPTIONS = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss.l Z",
      },
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
        };
      },
    },
    level: "debug",
  },
  production: true,
};

const fastify = Fastify({
  logger: LOGGER_OPTIONS[NODE_ENV] ?? false,
});

fastify.get("/react-flight", function reactFlightHandler(request, reply) {
  reply.header("Content-Type", "application/octet-stream");
  const pipeableStream = renderToPipeableStream(<App />, MODULE_MAP);
  pipeableStream.pipe(reply.raw);
});

module.exports = async function start() {
  try {
    await fastify.listen({ host: HTTP_HOST, port: HTTP_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
