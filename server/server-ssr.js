"use strict";

const path = require("node:path");
const { readFileSync } = require("node:fs");

const Fastify = require("fastify");
const fastifyStaticPlugin = require("@fastify/static");

const { renderReactComponentToHtmlPipeableStream } = require("./react-html");

const REACT_SSR_MANIFEST = JSON.parse(
  readFileSync(
    path.resolve(__dirname, "../dist/react-ssr-manifest.json"),
    "utf8"
  )
);

const ASSETS_PATH = "/assets/";

const PATCHED_REACT_SSR_MANIFEST = {
  ...REACT_SSR_MANIFEST,
  moduleLoading: { ...REACT_SSR_MANIFEST.moduleLoading, prefix: ASSETS_PATH },
};

const HTTP_HOST = process.env.HOST ?? "localhost";
const HTTP_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
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

fastify.register(fastifyStaticPlugin, {
  root: path.join(__dirname, "../dist"),
  prefix: ASSETS_PATH,
  logLevel: "warn",
});

fastify.register(fastifyStaticPlugin, {
  root: path.join(__dirname, "../public"),
  decorateReply: false,
  logLevel: "warn",
});

fastify.get("/", function routeHandler(request, reply) {
  renderReactComponentToHtmlPipeableStream(
    `http://${HTTP_HOST}:${HTTP_PORT + 1}/react-flight`,
    PATCHED_REACT_SSR_MANIFEST,
    {
      bootstrapScripts: ["runtime.js", "main.js"].map((asset) =>
        path.join(ASSETS_PATH, asset)
      ),
      onShellReady(htmlPipeableStream) {
        console.log("Shell Ready!");
        reply.raw.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
        });
        htmlPipeableStream.pipe(reply.raw);
      },
      onAllReady() {
        console.log("All Ready!");
      },
    }
  );
});

module.exports = async function start() {
  try {
    await fastify.listen({ host: HTTP_HOST, port: HTTP_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
