/*
 * Filename: traceId.middleware.js
 * Path: src/middlewares
 * Created Date: 2025-11-18
 * Author: System
 *
 * Description: Middleware untuk menambahkan trace_id dari OpenTelemetry ke setiap response
 */

import { trace } from "@opentelemetry/api";

/**
 * Middleware untuk menambahkan trace_id ke request object
 * Trace ID akan diambil dari active span OpenTelemetry
 *
 * @returns {Function} Express middleware function
 */
const traceIdMiddleware = () => {
  return (req, res, next) => {
    try {
      // Mendapatkan active span dari OpenTelemetry
      const span = trace.getActiveSpan();

      if (span) {
        // Mendapatkan span context yang berisi trace_id
        const spanContext = span.spanContext();

        if (spanContext && spanContext.traceId) {
          // Menyimpan trace_id ke request object agar bisa diakses di controller
          req.traceId = spanContext.traceId;

          // Optional: Juga menyimpan span_id untuk debugging lebih detail
          req.spanId = spanContext.spanId;
        }
      }

      // Jika tidak ada trace_id (OpenTelemetry disabled), set default
      if (!req.traceId) {
        req.traceId = 'no-trace';
      }

    } catch (error) {
      // Jika terjadi error, set default trace_id
      req.traceId = 'no-trace';
      console.error('[TraceIdMiddleware] Error getting trace_id:', error.message);
    }

    next();
  };
};

export default traceIdMiddleware;
