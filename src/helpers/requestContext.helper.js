import { AsyncLocalStorage } from "async_hooks";
import crypto from "crypto";
export const asyncContext = new AsyncLocalStorage();
export const generateRequestId = () => {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
};
export const getRequestId = () => {
  const context = asyncContext.getStore();
  return context?.requestId ?? "system";
};
export const getContext = () => {
  return asyncContext.getStore();
};
export const getMetadata = (key) => {
  const context = asyncContext.getStore();
  return context?.metadata?.[key];
};
export const setMetadata = (key, value) => {
  const context = asyncContext.getStore();
  if (context) {
    if (!context.metadata) {
      context.metadata = {};
    }
    context.metadata[key] = value;
  }
};
export const runWithContext = async (requestIdOrContext, fn) => {
  const context =
    typeof requestIdOrContext === "string"
      ? {
          requestId: requestIdOrContext,
          startTime: Date.now(),
        }
      : requestIdOrContext;
  return asyncContext.run(context, fn);
};
export const runWithNewContext = async (fn) => {
  return runWithContext(generateRequestId(), fn);
};
export const getElapsedTime = () => {
  const context = asyncContext.getStore();
  return context ? Date.now() - context.startTime : 0;
};
export const initializeRequestContext = (requestId) => {
  const context = {
    requestId: requestId || generateRequestId(),
    startTime: Date.now(),
  };
  asyncContext.enterWith(context);
};
