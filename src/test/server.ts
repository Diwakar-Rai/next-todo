import express from "express";
import request from "supertest";

export function createTestServer(handler: any) {
  const app = express();
  app.use(express.json());
  app.all(/.*/, async (req, res) => {
    const webRequest = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers as any,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });
    const response = await handler(webRequest);
    const data = await response.json();
    res.status(response.status).json(data);
  });
  return request(app);
}
