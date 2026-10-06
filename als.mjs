import { AsyncLocalStorage } from "node:async_hooks";
const als = new AsyncLocalStorage();
process.on("unhandledRejection", (reason) => {
  console.log("handler store =", als.getStore(), "reason =", reason.message);
});
als.run({ type: "prerender-client" }, () => {
  const ac = new AbortController();
  new Promise((_, reject) => ac.signal.addEventListener("abort", () => reject(new Error("hang"))));
  setTimeout(() => ac.abort(), 5);
});
setTimeout(() => {}, 50);
