import { sendError } from '../utils/responseHandler.js';

export const notFoundHandler = (req, res) => {
  return sendError(
    res,
    `Cannot find endpoint '${req.method} ${req.originalUrl}' on this server.`,
    404
  );
};
