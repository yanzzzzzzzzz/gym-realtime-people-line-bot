import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sources, fetchGymInfo, clearFetchCache } from "../src/sources.js";

// mock global fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  clearFetchCache();
  // ensure real timers by default
  try {
    vi.useRealTimers();
  } catch {}
});

afterEach(() => {
  try {
    vi.useRealTimers();
  } catch {}
});

describe("fetchGymInfo dedupe and cache", () => {
  it("dedupes concurrent requests to the same endpoint", async () => {
    const a = sources.find((s) => s.name === "大安運動中心");
    const b = sources.find((s) => s.name === "松山運動中心");
    expect(a).toBeDefined();
    expect(b).toBeDefined();

    const mockJson = {
      locationPeopleNums: [
        { lidName: "大安", gymPeopleNum: "10", gymMaxPeopleNum: "100" },
        { lidName: "松山", gymPeopleNum: "20", gymMaxPeopleNum: "200" },
      ],
    };

    (global.fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockJson) });

    const [ra, rb] = await Promise.all([fetchGymInfo(a!), fetchGymInfo(b!)]);

    // only one network call for the shared endpoint
    expect((global.fetch as any).mock.calls.length).toBe(1);

    expect(ra).toEqual([
      { name: "大安運動中心", region: "台北", gymCurrent: 10, gymMax: 100 },
    ]);
    expect(rb).toEqual([
      { name: "松山運動中心", region: "台北", gymCurrent: 20, gymMax: 200 },
    ]);
  });

  it("returns cached response within TTL", async () => {
    const s = sources.find((x) => x.name === "大安運動中心");
    expect(s).toBeDefined();

    const mockJson = { locationPeopleNums: [{ lidName: "大安", gymPeopleNum: "11", gymMaxPeopleNum: "110" }] };
    (global.fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockJson) });

    const r1 = await fetchGymInfo(s!);
    const r2 = await fetchGymInfo(s!);

    // fetch only called once because second call used cache
    expect((global.fetch as any).mock.calls.length).toBe(1);
    expect(r2).toEqual(r1);
  });

  it("re-fetches after cache TTL expires", async () => {
    // use fake timers and control system time
    vi.useFakeTimers();
    const start = Date.now();
    vi.setSystemTime(start);

    const s = sources.find((x) => x.name === "大安運動中心");
    expect(s).toBeDefined();

    const mock1 = { locationPeopleNums: [{ lidName: "大安", gymPeopleNum: "1", gymMaxPeopleNum: "10" }] };
    const mock2 = { locationPeopleNums: [{ lidName: "大安", gymPeopleNum: "2", gymMaxPeopleNum: "20" }] };

    (global.fetch as any).mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(mock1) });
    const r1 = await fetchGymInfo(s!);
    expect((global.fetch as any).mock.calls.length).toBe(1);

    // advance time beyond cache TTL (30s)
    vi.setSystemTime(start + 30_000 + 1);

    (global.fetch as any).mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(mock2) });
    const r2 = await fetchGymInfo(s!);

    expect((global.fetch as any).mock.calls.length).toBe(2);
    expect(r2).toEqual([{ name: "大安運動中心", region: "台北", gymCurrent: 2, gymMax: 20 }]);

    vi.useRealTimers();
  });
});
