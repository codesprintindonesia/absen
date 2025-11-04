/**
 * Tracing Middleware
 * Add custom tracing attributes to HTTP requests
 * Following Bank Sultra Coding Guidelines
 */

import { trace } from '@opentelemetry/api';

/**
 * Middleware to enrich spans with custom attributes
 */
const tracingMiddleware = (req, res, next) => {
  const span = trace.getActiveSpan();
  
  if (span) {
    // Add request attributes
    span.setAttribute('http.method', req.method);
    span.setAttribute('http.url', req.url);
    span.setAttribute('http.user_agent', req.get('user-agent') || 'unknown');
    
    // Add custom business attributes if available
    if (req.user) {
      span.setAttribute('user.id', req.user.id);
      span.setAttribute('user.role', req.user.role);
    }
    
    // Add correlation ID if exists
    const correlationId = req.headers['x-correlation-id'];
    if (correlationId) {
      span.setAttribute('correlation.id', correlationId);
    }
    
    // Track response
    const jadwalSend = res.send;
    res.send = function(data) {
      span.setAttribute('http.status_code', res.statusCode);
      span.setAttribute('http.response_size', Buffer.byteLength(JSON.stringify(data)));
      return jadwalSend.call(this, data);
    };
  }
  
  next();
};

export { tracingMiddleware };