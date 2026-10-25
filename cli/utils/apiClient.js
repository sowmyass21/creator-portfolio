import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export const request = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}${path}`);
    const bodyString = data ? JSON.stringify(data) : null;

    const reqHeaders = {
      'Accept': 'application/json',
      ...headers
    };

    if (bodyString) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: reqHeaders,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
          } else {
            resolve({ statusCode: res.statusCode, error: parsed, data: parsed, headers: res.headers });
          }
        } catch (e) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Server connection failed on ${API_BASE_URL}${path}: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out for ${path}`));
    });

    if (bodyString) {
      req.write(bodyString);
    }
    req.end();
  });
};

export default { request };
