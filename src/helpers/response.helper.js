import HTTP_STATUS from "../constants/httpStatus.constant.js";

export function buildResponse({
  code = HTTP_STATUS.OK,   // default ikut 200
  message = "OK",
  data = null,
  metadata = null,
} = {}) {
  return { code, message, data, metadata };
}

export function sendResponse(
  res,
  {
    httpCode = HTTP_STATUS.OK,  // default 200
    code = httpCode,            // default ikut httpCode
    message = "OK",
    data = null,
    metadata = null,
  } = {}
) {
  // Ambil trace_id dan span_id dari request object (diset oleh traceIdMiddleware)
  const traceId = res.req?.traceId;
  const spanId = res.req?.spanId;

  // Merge metadata dengan trace information
  const enrichedMetadata = {
    ...metadata,
    ...(traceId && { trace_id: traceId }),
    ...(spanId && { span_id: spanId }),
  };

  return res.status(httpCode).json(buildResponse({
    code,
    message,
    data,
    metadata: enrichedMetadata
  }));
}
