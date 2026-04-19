import client from "prom-client";
import { Request, Response, NextFunction } from "express";

export const register = new client.Registry();

register.setDefaultLabels({ app: "release-ready" });
client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpRequestErrorsTotal = new client.Counter({
  name: "http_request_errors_total",
  help: "Total number of HTTP requests resulting in 5xx responses",
  labelNames: ["method", "route"],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const route = req.route?.path
      ? `${req.baseUrl ?? ""}${req.route.path}`
      : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
    if (res.statusCode >= 500) {
      httpRequestErrorsTotal.inc({ method: req.method, route });
    }
  });
  next();
}

export function resetMetrics(): void {
  register.resetMetrics();
}
