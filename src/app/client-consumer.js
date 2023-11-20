"use client";
import { use } from "react";

export function ClientConsumer({ promise, children }) {
  console.log("ClientConsumer before the use()");
  const value = use(promise);
  console.log("ClientConsumer after the use()", value);

  return children;
}
