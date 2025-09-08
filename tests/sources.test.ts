import { describe, it, expect, vi, beforeEach } from "vitest";
import { sources, fetchGymInfo } from "../src/sources.js";

// use a global fetch mock so tests don't perform network requests
global.fetch = vi.fn();

describe("sources (order-independent)", () => {
  it("exports required named sources", () => {
    const required = [
      "南港運動中心",
      "桃園八德運動中心",
      "成德運動中心",
    ];

    required.forEach((name) => {
      const s = sources.find((x) => x.name === name);
      expect(s).toBeDefined();
    });
  });

  it("has sensible urls for known sources", () => {
    const mapping: Record<string, string> = {
      "南港運動中心": "ngsc.cyc.org.tw",
      "桃園八德運動中心": "bdcsc.cyc.org.tw",
      "成德運動中心": "wd10.xuanen.com.tw",
    };

    Object.entries(mapping).forEach(([name, domain]) => {
      const s = sources.find((x) => x.name === name);
      expect(s).toBeDefined();
      expect(s!.url).toContain(domain);
    });
  });
});

describe("fetchGymInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET sources call fetch without body and parse text response", async () => {
    const chengde = sources.find((s) => s.name === "成德運動中心");
    expect(chengde).toBeDefined();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("4,80,0"),
    });

    const result = await fetchGymInfo(chengde!);

  // doFetch passes a signal as second arg; check the first argument == url
  expect((global.fetch as any).mock.calls.length).toBeGreaterThan(0);
  const [calledUrlGet] = (global.fetch as any).mock.calls[0];
  expect(calledUrlGet).toBe(chengde!.url);
    expect(result).toEqual([
      { name: "成德運動中心", region: "台北", gymCurrent: 4, gymMax: 80 },
    ]);
  });

});

describe("parsers (order-independent)", () => {

  it("Nangang parser parses gym array", () => {
    const nangang = sources.find((s) => s.name === "南港運動中心");
    const result = nangang!.parse({ gym: [30, 120] });
    expect(result).toEqual([
      { name: "南港運動中心", region: "台北", gymCurrent: 30, gymMax: 120 },
    ]);
  });

  it("Taoyuan Bade parser parses gym array", () => {
    const bade = sources.find((s) => s.name === "桃園八德運動中心");
    const result = bade!.parse({ gym: ["25", "80", "0"] });
    expect(result).toEqual([
      { name: "桃園八德運動中心", region: "桃園", gymCurrent: 25, gymMax: 80 },
    ]);
  });

  it("Chengde parser parses CSV string", () => {
    const chengde = sources.find((s) => s.name === "成德運動中心");
    const result = chengde!.parse("4,80,0");
    expect(result).toEqual([
      { name: "成德運動中心", region: "台北", gymCurrent: 4, gymMax: 80 },
    ]);
  });
});

