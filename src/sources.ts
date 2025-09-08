import { GymInfo, Source } from "./types.js";

// Node 18+ 原生有 fetch，無需額外安裝
const TAIPEI_ENDPOINT =
  "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum";

export const sources: Source[] = [
  {
    name: "台北運動中心",
    url: TAIPEI_ENDPOINT,
    method: "POST",
    parse: (data: any) =>
      data.locationPeopleNums?.map((x: any) => ({
        name: `${x.lidName}運動中心`,
        region: "台北",
        gymCurrent: Number(x.gymPeopleNum ?? 0),
        gymMax: Number(x.gymMaxPeopleNum ?? 0),
      })) ?? [],
  },
  {
    name: "南港運動中心",
    url: "https://ngsc.cyc.org.tw/api",
    method: "POST",
    parse: (data: any) => [
      {
        name: "南港運動中心",
        region: "台北",
        gymCurrent: Number(data.gym?.[0] ?? 0),
        gymMax: Number(data.gym?.[1] ?? 0),
      },
    ],
  },
  {
    name: "成德運動中心",
    url: "https://wd10.xuanen.com.tw/display/discode.aspx?action=z2",
    method: "GET",
    parse: (data: any) => {
      // data is a string like "4,80,0"
      const [current, max] = (typeof data === "string" ? data : "").split(",").map(Number);
      return [{
        name: "成德運動中心",
        region: "台北",
        gymCurrent: current ?? 0,
        gymMax: max ?? 0,
      }];
    },
  },
  {
    name: "桃園八德運動中心",
    url: "https://bdcsc.cyc.org.tw/api",
    method: "POST",
    parse: (data: any) => [
      {
        name: "桃園八德運動中心",
        region: "桃園",
        gymCurrent: Number(data.gym?.[0] ?? 0),
        gymMax: Number(data.gym?.[1] ?? 0),
      },
    ],
  }
];

export async function fetchGymInfo(source: Source): Promise<GymInfo[]> {
  try {
    let resp;
    if (source.method === "GET") {
      resp = await fetch(source.url);
      if (!resp.ok) return [];
      const data = await resp.text();
      return source.parse(data);
    } else {
      resp = await fetch(source.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      return source.parse(data);
    }
  } catch {
  return [];
  }
}
