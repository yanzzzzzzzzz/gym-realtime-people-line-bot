
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
    name: "台北運動中心",
    region: "台北",
    official: "https://booking-tpsc.sporetrofit.com/Home/LocationPeopleNum",
    api: "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum",
    method: "POST",
    parse: function (data: any) {
      return (data.locationPeopleNums?.map((x: any) => ({
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
  try {
    if (source.method === "GET") {
      const resp = await doFetch(source.url);
      if (!resp || !resp.ok) return [];
      const data = await resp.text();
      return source.parse(data);
    }

    // POST (default)
    const resp = await doFetch(source.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!resp || !resp.ok) return [];
    const data = await resp.json();
    return source.parse(data);
  } catch (err: any) {
    // keep errors quiet for runtime but log debug info to help troubleshooting
    console.debug("fetchGymInfo error for", source.name, err?.message ?? err);
    return [];
  }
}