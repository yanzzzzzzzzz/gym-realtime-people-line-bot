import express from "express";
import { sources, fetchGymInfo } from "./sources.js";

export function setupRoutes(app: express.Application) {
  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  app.get("/api/people", async (_req, res) => {
    try {
      const results = await Promise.all(sources.map(fetchGymInfo));
      const items = results.flat();
      res.json({ items });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "fetch_failed", message: err?.message ?? String(err) });
    }
  });
}
