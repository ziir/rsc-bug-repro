"use strict";

const stream = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { renderToPipeableStream } = require("react-dom/server");
const {
  createFromNodeStream,
} = require("react-server-dom-webpack/client.node.unbundled");

const { ServerRoot } = require("./server-root");

const BOOTSTRAP_SCRIPT_CONTENT = "window.__RSC_PAYLOAD__ = []";

export function renderReactComponentToHtmlPipeableStream(
  endpoint,
  ssrManifest,
  options
) {
  const flightFetch = fetch(endpoint);
  let inlinedFlightDataStream = null;

  let flightResponse = null;
  const createFlightResponse = () => {
    if (flightResponse !== null) return flightResponse;

    flightResponse = flightFetch.then((flightFetchResponse) => {
      const [
        clientFlightFetchResponseReadableStream,
        serverFlightFetchResponseReadableStream,
      ] = flightFetchResponse.body.tee();

      inlinedFlightDataStream = clientFlightFetchResponseReadableStream;

      return createFromNodeStream(
        stream.Readable.fromWeb(serverFlightFetchResponseReadableStream),
        ssrManifest
      );
    });

    return flightResponse;
  };

  const renderStreamPassThrough = new stream.PassThrough();
  const destinationStream = new stream.PassThrough();

  const renderStream = renderToPipeableStream(
    <ServerRoot createFlightResponse={createFlightResponse} />,
    {
      ...options,
      bootstrapScriptContent: BOOTSTRAP_SCRIPT_CONTENT,
      onShellReady() {
        renderStream.pipe(renderStreamPassThrough);
        options.onShellReady(destinationStream);
      },
    }
  );

  pipeline(
    renderStreamPassThrough,
    async function* transform(source, { signal }) {
      source.setEncoding("utf8");
      for await (const chunk of source) {
        let updated = chunk;
        if (chunk.includes("</html>")) {
          for await (const flightDataChunk of inlinedFlightDataStream) {
            updated = updated.replace("</body></html>", "");
            updated += `<script>window.__RSC_PAYLOAD__.push(${JSON.stringify(
              Buffer.from(flightDataChunk).toString("utf-8")
            )})</script>`;
          }
          updated += "</body></html>";
          yield updated;
        } else {
          yield chunk;
        }
      }
    },
    destinationStream
  );
}
