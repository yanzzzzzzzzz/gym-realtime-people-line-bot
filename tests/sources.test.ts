import { describe, it, expect, vi, beforeEach } from "vitest";
import { sources, fetchGymInfo } from "../src/sources.js";
import { GymInfo } from "../src/types.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("sources", () => {
  it("should have four sources configured", () => {
    expect(sources).toHaveLength(4);
    expect(sources[0].name).toBe("台北運動中心");
    expect(sources[1].name).toBe("南港運動中心");
    expect(sources[2].name).toBe("桃園八德運動中心");
    expect(sources[3].name).toBe("成德運動中心");
  });

  it("should have correct URLs", () => {
    expect(sources[0].url).toContain("booking-tpsc.sporetrofit.com");
    expect(sources[1].url).toContain("ngsc.cyc.org.tw");
    expect(sources[2].url).toContain("bdcsc.cyc.org.tw");
    expect(sources[3].url).toContain("wd10.xuanen.com.tw");
  });
});

describe("fetchGymInfo", () => {
  const mockSource = {
    name: "Test Gym",
    url: "https://test.com/api",
    parse: (data: any) => [
      {
        name: "Test Gym Center",
        region: "Test Region",
        gymCurrent: 10,
        gymMax: 100,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return parsed data on successful fetch", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ test: "data" }),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchGymInfo(mockSource);

    expect(global.fetch).toHaveBeenCalledWith(mockSource.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(result).toEqual([
      {
        name: "Test Gym Center",
        region: "Test Region",
        gymCurrent: 10,
        gymMax: 100,
      },
    ]);
  });

  it("should return empty array on fetch failure", async () => {
    const mockResponse = {
      ok: false,
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchGymInfo(mockSource);

    expect(result).toEqual([]);
  });

  it("should return empty array on network error", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    const result = await fetchGymInfo(mockSource);

    expect(result).toEqual([]);
  });
});

describe("Taipei source parsing", () => {
  it("should parse Taipei gym data correctly", () => {
    const mockData = {
      locationPeopleNums: [
        {
          lidName: "松山",
          gymPeopleNum: "25",
          gymMaxPeopleNum: "200",
        },
        {
          lidName: "信義",
          gymPeopleNum: null,
          gymMaxPeopleNum: "150",
        },
      ],
    };

    const result = sources[0].parse(mockData);

    expect(result).toEqual([
      {
        name: "松山運動中心",
        region: "台北",
        gymCurrent: 25,
        gymMax: 200,
      },
      {
        name: "信義運動中心",
        region: "台北",
        gymCurrent: 0,
        gymMax: 150,
      },
    ]);
  });

  it("should handle empty locationPeopleNums", () => {
    const mockData = { locationPeopleNums: null };

    const result = sources[0].parse(mockData);

    expect(result).toEqual([]);
  });
});

describe("Nangang source parsing", () => {
  it("should parse Nangang gym data correctly", () => {
    const mockData = {
      gym: [30, 120],
    };

    const result = sources[1].parse(mockData);

    expect(result).toEqual([
      {
        name: "南港運動中心",
        region: "台北",
        gymCurrent: 30,
        gymMax: 120,
      },
    ]);
  });

  it("should handle missing gym data", () => {
    const mockData = { gym: null };

    const result = sources[1].parse(mockData);

    expect(result).toEqual([
      {
        name: "南港運動中心",
        region: "台北",
        gymCurrent: 0,
        gymMax: 0,
      },
    ]);
  });
});

describe("Taoyuan Bade source parsing", () => {
  it("should parse Taoyuan Bade gym data correctly", () => {
    const mockData = {
      gym: ["25", "80", "0"],
    };

    const result = sources[2].parse(mockData);

    expect(result).toEqual([
      {
        name: "桃園八德運動中心",
        region: "桃園",
        gymCurrent: 25,
        gymMax: 80,
      },
    ]);
  });

  it("should handle missing gym data", () => {
    const mockData = { gym: null };

    const result = sources[2].parse(mockData);

    expect(result).toEqual([
      {
        name: "桃園八德運動中心",
        region: "桃園",
        gymCurrent: 0,
        gymMax: 0,
      },
    ]);
  });
});

describe("Chengde source parsing", () => {
  it("should parse Chengde gym data correctly", () => {
    const mockData = {
      gym: ["4", "80", "0"],
    };

    const result = sources[3].parse(mockData);

    expect(result).toEqual([
      {
        name: "成德運動中心",
        region: "台北",
        gymCurrent: 4,
        gymMax: 80,
      },
    ]);
  });

  it("should handle missing gym data", () => {
    const mockData = { gym: null };

    const result = sources[3].parse(mockData);

    expect(result).toEqual([
      {
        name: "成德運動中心",
        region: "台北",
        gymCurrent: 0,
        gymMax: 0,
      },
    ]);
  });
});
