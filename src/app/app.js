import { Suspense } from "react";

import { ClientConsumer } from "./client-consumer";

export function App() {
  const promise = new Promise((resolve) =>
    setTimeout(() => resolve(["foo", "bar"]), 1_000)
  );

  return (
    <Suspense fallback="loading ...">
      <ClientConsumer promise={promise}>hello world</ClientConsumer>
    </Suspense>
  );
}
