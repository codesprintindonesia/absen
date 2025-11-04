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
  return res.status(httpCode).json(buildResponse({ code, message, data, metadata }));
}
