import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { createFromReadableStream } from "react-server-dom-webpack/client";

import { withErrorBoundary } from "./app/error-boundary";
import { Root } from "./app/root";

function start() {
  const flightResponseText = window.__RSC_PAYLOAD__.join("");

  console.debug(flightResponseText);

  const flightTreePromise = createFromReadableStream(
    new Response(flightResponseText).body
  );

  console.debug("[client]", "hydrating root");
  hydrateRoot(
    document.getElementById("root"),
    createElement(withErrorBoundary(Root), {
      flightTreePromise,
    })
  );
}

const ready = new Promise((resolve) =>
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", resolve)
    : resolve()
);

await ready;

start();
