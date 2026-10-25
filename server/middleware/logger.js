/**
 * HTTP Request Logging Middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    console.log(`[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms (${ip})`);
  });

  next();
};
