
import { GymInfo, Source } from "./types.js";

// 共用解析器
function cycDataGymParse() {
  return function (this: GymMeta, data: any) {
    return [{
      name: this.name,
      region: this.region,
      gymCurrent: Number(data.gym?.[0] ?? 0),
      gymMax: Number(data.gym?.[1] ?? 0),
    }];
  };
}

// 運動中心資料
type GymMeta = {
  name: string;
  region: string;
  official: string;
  api: string;
  method: "GET" | "POST";
  parse: (data: any) => GymInfo[];
};

export const gyms: GymMeta[] = [
  {
    name: "大安運動中心",
    region: "台北",
    official: "https://www.daansports.com.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "大安").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "北投運動中心",
    region: "台北",
    official: "https://www.btsport.org.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "北投").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "大同運動中心",
    region: "台北",
    official: "https://www.dtsc-wdyg.com.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "大同").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "內湖運動中心",
    region: "台北",
    official: "https://nhsc.cyc.org.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "內湖").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "松山運動中心",
    region: "台北",
    official: "https://sssc.com.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "松山").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "文山運動中心",
    region: "台北",
    official: "https://wssc.cyc.org.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "文山").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "中山運動中心",
    region: "台北",
    official: "https://cssc.cyc.org.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "中山").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "中正運動中心",
    region: "台北",
    official: "https://wsjjsc.com.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "中正").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "士林運動中心",
    region: "台北",
    official: "https://www.slsc-taipei.org/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "士林").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "萬華運動中心",
    region: "台北",
    official: "https://whsc.com.tw/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "萬華").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "信義運動中心",
    region: "台北",
    official: "https://xysc.teamxports.com/",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.filter((l: any) => l.lidName === "信義").map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: this.region,
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? []);
    },
  },
  {
    name: "南港運動中心",
    region: "台北",
    official: "https://ngsc.cyc.org.tw/",
    api: "https://ngsc.cyc.org.tw/api",
    method: "POST",
    parse: cycDataGymParse(),
  },
  {
    name: "成德運動中心",
    region: "台北",
    official: "https://wd10.xuanen.com.tw/BPHome/BPHome",
    api: "https://wd10.xuanen.com.tw/display/discode.aspx?action=z2",
    method: "GET",
    parse: function (data: any) {
      const [current, max] = (typeof data === "string" ? data : "").split(",").map(Number);
      return [{
        name: this.name,
        region: this.region,
        gymCurrent: current ?? 0,
        gymMax: max ?? 0,
      }];
    },
  },
  {
    name: "桃園八德運動中心",
    region: "桃園",
    official: "https://bdcsc.cyc.org.tw/",
    api: "https://bdcsc.cyc.org.tw/api",
    method: "POST",
    parse: cycDataGymParse(),
  },
  {
    name: "桃園國民運動中心",
    region: "桃園",
    official: "https://tycsc.cyc.org.tw/",
    api: "https://tycsc.cyc.org.tw/api",
    method: "POST",
    parse: cycDataGymParse(),
  },
  {
    name: "中壢國民運動中心",
    region: "桃園",
    official: "https://zlcsc.cyc.org.tw/",
    api: "https://zlcsc.cyc.org.tw/api",
    method: "POST",
    parse: cycDataGymParse(),
  },
  {
    name: "南平運動中心",
    region: "桃園",
    official: "https://www.npsc.com.tw/",
    api: "https://www.npsc.com.tw/parser.php",
    method: "GET",
    parse: function (data: any) {
      const [gym, _] = (typeof data === "string" ? data : "").split(",").map(Number);
      return [{
        name: this.name,
        region: this.region,
        gymCurrent: gym ?? 0,
        gymMax: 75,
      }];
    },
  },
];

// mapper: 名稱 => { region, official }
export const gymMapper: Record<string, { region: string; official: string }> =
  gyms.reduce((acc, gym) => {
    acc[gym.name] = { region: gym.region, official: gym.official };
    return acc;
  }, {} as Record<string, { region: string; official: string }>);

// bind parse functions so they retain gym metadata when used elsewhere
gyms.forEach((gym) => {
  if (typeof gym.parse === "function") {
    gym.parse = (gym.parse as Function).bind(gym) as (data: any) => GymInfo[];
  }
});

// 產生 sources
export const sources: Source[] = gyms.map((gym) => ({
  name: gym.name,
  url: gym.api,
  method: gym.method,
  parse: gym.parse,
}));

// dedupe concurrent requests to the same endpoint (method:url:body)
// inflightRequests stores the raw fetched payload (json or text)
const inflightRequests = new Map<string, Promise<{ type: "json" | "text"; data: any }>>();
// simple response cache to avoid frequent repeated requests (stores raw payload)
const responseCache = new Map<string, { ts: number; type: "json" | "text"; data: any }>();
const CACHE_TTL = 30_000; // ms

// test helper: clear internal caches (useful for unit tests)
export function clearFetchCache() {
  inflightRequests.clear();
  responseCache.clear();
}
/**
 * Small fetch helper with timeout to protect against hung requests.
 * Returns the Response or throws on network error/timeout.
 */
async function doFetch(url: string, options: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchGymInfo(source: Source): Promise<GymInfo[]> {
  const body = source.method === "POST" ? "{}" : "";
  const key = `${source.method}:${source.url}:${body}`;

  // return cached raw response if valid
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.type === "json" ? source.parse(cached.data) : source.parse(cached.data);
  }

  if (inflightRequests.has(key)) {
    const payload = await inflightRequests.get(key)!;
    return payload.type === "json" ? source.parse(payload.data) : source.parse(payload.data);
  }

  const promise = (async () => {
    try {
      if (source.method === "GET") {
        const resp = await doFetch(source.url);
        if (!resp || !resp.ok) return { type: "text", data: "" } as const;
        const data = await resp.text();
        // cache raw text
        responseCache.set(key, { ts: Date.now(), type: "text", data });
        return { type: "text", data } as const;
      }

      // POST (default)
      const resp = await doFetch(source.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!resp || !resp.ok) return { type: "json", data: null } as const;
      const data = await resp.json();
      // cache raw json
      responseCache.set(key, { ts: Date.now(), type: "json", data });
      return { type: "json", data } as const;
    } catch (err: any) {
      console.debug("fetchGymInfo error for", source?.name ?? source.url, err?.message ?? err);
      return { type: "json", data: null } as const;
    } finally {
      inflightRequests.delete(key);
    }
  })();

  inflightRequests.set(key, promise);
  const payload = await promise;
  return payload.type === "json" ? source.parse(payload.data) : source.parse(payload.data);
}