import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { setupRoutes } from "../src/routes.js";
import { sources, fetchGymInfo } from "../src/sources.js";

// Mock @line/bot-sdk first
vi.mock("@line/bot-sdk", () => ({
  validateSignature: vi.fn(() => true), // Mock signature validation to always pass
  messagingApi: {
    MessagingApiClient: vi.fn().mockImplementation(() => ({
      replyMessage: vi.fn(),
    })),
  },
}));

// Mock the sources module
vi.mock("../src/sources.js", () => ({
  sources: [
    { name: "Test Source 1", url: "https://test1.com", parse: vi.fn() },
    { name: "Test Source 2", url: "https://test2.com", parse: vi.fn() },
  ],
  fetchGymInfo: vi.fn(),
}));

// Set dummy environment variables for tests
process.env.LINE_CHANNEL_ACCESS_TOKEN = "dummy_token";
process.env.LINE_CHANNEL_SECRET = "dummy_secret";

describe("Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    setupRoutes(app);
    vi.clearAllMocks();
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("ts");
      expect(typeof response.body.ts).toBe("string");
    });

    it("should return valid ISO timestamp", async () => {
      const response = await request(app).get("/health");
      const timestamp = new Date(response.body.ts);

      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe("GET /api/people", () => {
    it("should return gym data from all sources", async () => {
      const mockGymData = [
        { name: "Gym 1", gymCurrent: 10, gymMax: 100 },
        { name: "Gym 2", gymCurrent: 20, gymMax: 200 },
      ];

      (fetchGymInfo as any)
        .mockResolvedValueOnce([mockGymData[0]])
        .mockResolvedValueOnce([mockGymData[1]]);

      const response = await request(app).get("/api/people");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toEqual(mockGymData);
      expect(fetchGymInfo).toHaveBeenCalledTimes(2);
    });

    it("should handle fetch errors gracefully", async () => {
      (fetchGymInfo as any).mockRejectedValue(new Error("Network error"));

      const response = await request(app).get("/api/people");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "fetch_failed");
      expect(response.body).toHaveProperty("message");
    });

    it("should flatten results from multiple sources", async () => {
      const mockData1 = [
        { name: "Gym A", gymCurrent: 5, gymMax: 50 },
        { name: "Gym B", gymCurrent: 15, gymMax: 150 },
      ];
      const mockData2 = [{ name: "Gym C", gymCurrent: 25, gymMax: 250 }];

      (fetchGymInfo as any)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const response = await request(app).get("/api/people");

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(3);
      expect(response.body.items).toEqual([...mockData1, ...mockData2]);
    });
  });
});
