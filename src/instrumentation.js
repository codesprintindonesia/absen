import { openTelemetry } from "./libraries/otel.library.js";

console.log("[Instrumentation] Initializing OpenTelemetry...");

// melakukan inisialisasi OpenTelemetry sebelum module lain diimport dan digunakan
openTelemetry.initialize();

console.log("[Instrumentation] OpenTelemetry initialized");