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
    { name: "Test Source 3", url: "https://test3.com", parse: vi.fn() },
    { name: "Test Source 4", url: "https://test4.com", parse: vi.fn() },
  ],
  // also provide `gyms` used by fetch-by-region / fetch-by-keyword helpers
  gyms: [
    { name: "Test Source 1", region: "台北", api: "https://test1.com", method: "POST", parse: vi.fn() },
    { name: "Test Source 2", region: "桃園", api: "https://test2.com", method: "POST", parse: vi.fn() },
    { name: "Test Source 3", region: "台北", api: "https://test3.com", method: "POST", parse: vi.fn() },
    { name: "Test Source 4", region: "台中", api: "https://test4.com", method: "POST", parse: vi.fn() },
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
        { name: "Gym 1", region: "台北", gymCurrent: 10, gymMax: 100 },
        { name: "Gym 2", region: "桃園", gymCurrent: 20, gymMax: 200 },
      ];

      (fetchGymInfo as any)
        .mockResolvedValueOnce([mockGymData[0]])
        .mockResolvedValueOnce([mockGymData[1]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const response = await request(app).get("/api/people");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toEqual(mockGymData);
      expect(fetchGymInfo).toHaveBeenCalledTimes(4);
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
        { name: "Gym A", region: "台北", gymCurrent: 5, gymMax: 50 },
        { name: "Gym B", region: "台北", gymCurrent: 15, gymMax: 150 },
      ];
      const mockData2 = [
        { name: "Gym C", region: "桃園", gymCurrent: 25, gymMax: 250 },
      ];

      (fetchGymInfo as any)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const response = await request(app).get("/api/people");

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(3);
      expect(response.body.items).toEqual([...mockData1, ...mockData2]);
    });

    it("should filter by region when region query parameter is provided", async () => {
      const mockGymData = [
        { name: "桃園運動中心", region: "桃園", gymCurrent: 20, gymMax: 200 },
        { name: "南港運動中心", region: "台北", gymCurrent: 30, gymMax: 300 },
      ];

      // make fetchGymInfo return data based on the source argument it receives
      (fetchGymInfo as any).mockImplementation((src: any) => {
        if (src.name === "Test Source 2") return Promise.resolve([mockGymData[0]]);
        if (src.name === "Test Source 3") return Promise.resolve([mockGymData[1]]);
        return Promise.resolve([]);
      });

      const response = await request(app).get("/api/people?region=台北");

      expect(response.status).toBe(200);
      // only gyms in the mocked `gyms` with region '台北' should be returned
      expect(response.body.items.every((g: any) => g.region === "台北")).toBe(true);
      expect(response.body.items).toHaveLength(1);
    });

    it("should return empty array when no gyms match the region", async () => {
      const mockGymData = [
        { name: "南港運動中心", region: "台北", gymCurrent: 10, gymMax: 100 },
        { name: "桃園運動中心", region: "桃園", gymCurrent: 20, gymMax: 200 },
      ];

      (fetchGymInfo as any)
        .mockResolvedValueOnce([mockGymData[0]])
        .mockResolvedValueOnce([mockGymData[1]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const response = await request(app).get("/api/people?region=新竹");

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(0);
      expect(response.body.items).toEqual([]);
    });
  });
});
