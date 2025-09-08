import express from "express";
import { messagingApi, validateSignature } from "@line/bot-sdk";
import { sources, fetchGymInfo, gyms } from "./sources.js";
import { GymInfo } from "./types.js";
import { taiwanRegions } from "./constants.js";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

let client: messagingApi.MessagingApiClient | null = null;

function getClient() {
  if (!client && config.channelAccessToken && config.channelSecret) {
    client = new messagingApi.MessagingApiClient({
      channelAccessToken: config.channelAccessToken,
    });
  }
  return client;
}
export async function fetchGymInfoByRegion(region: string): Promise<GymInfo[]> {
  const regionGyms = gyms.filter((g: typeof gyms[0]) => g.region === region);
  const results = await Promise.all(
    regionGyms.map((gym: typeof gyms[0]) =>
      fetchGymInfo({
        name: gym.name,
        url: gym.api,
        method: gym.method,
        parse: gym.parse,
      })
    )
  );
  return results.flat();
}

export async function fetchGymInfoByKeyword(keyword: string): Promise<GymInfo[]> {
  const matchedGyms = gyms.filter((g: typeof gyms[0]) => g.name.includes(keyword));
  const results = await Promise.all(
    matchedGyms.map((gym: typeof gyms[0]) =>
      fetchGymInfo({
        name: gym.name,
        url: gym.api,
        method: gym.method,
        parse: gym.parse,
      })
    )
  );
  return results.flat();
}

export function setupRoutes(app: express.Application) {
  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  app.get("/api/people", async (req, res) => {
    try {
      let items: GymInfo[] = [];
      const region = req.query.region as string;
      const keyword = req.query.keyword as string;
      if (region) {
        items = await fetchGymInfoByRegion(region);
      } else if (keyword) {
        items = await fetchGymInfoByKeyword(keyword);
      } else {
        const results = await Promise.all(sources.map(fetchGymInfo));
        items = results.flat();
      }
      res.json({ items });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "fetch_failed", message: err?.message ?? String(err) });
    }
  });

  if (getClient() && config.channelSecret && config.channelAccessToken) {
    app.post("/webhook", async (req, res) => {
      try {
        // Manual signature validation
        const signature = req.headers["x-line-signature"] as string;
        const body = JSON.stringify(req.body);

        if (!validateSignature(body, config.channelSecret, signature)) {
          return res.status(401).json({ error: "Signature validation failed" });
        }

        const events = req.body.events;
        await Promise.all(events.map(handleEvent));
        res.status(200).end();
      } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }
}


async function handleEvent(event: any) {
  const currentClient = getClient();
  if (!currentClient) return;

  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const userMessage = event.message.text.trim();
  let gyms: GymInfo[] = [];
  let replyText = "";

  if (taiwanRegions.includes(userMessage)) {
    gyms = await fetchGymInfoByRegion(userMessage);
    if (gyms.length > 0) {
      replyText = `${userMessage}地區的運動中心：\n`;
      gyms.forEach((gym) => {
        replyText += `${gym.name}: ${gym.gymCurrent}/${gym.gymMax} 人\n`;
      });
      replyText = replyText.trim();
    } else {
      replyText = `${userMessage}地區目前沒有支援的運動中心。`;
    }
  } else {
    gyms = await fetchGymInfoByKeyword(userMessage);
    if (gyms.length > 0) {
      replyText = gyms
        .map((gym) => `${gym.name} 當前人數 ${gym.gymCurrent}/${gym.gymMax}`)
        .join("\n");
    } else {
      replyText =
        "找不到相關場館，請輸入地區（如「台北」、「桃園」）或關鍵字如「南港」。";
    }
  }

  await currentClient.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: replyText,
      },
    ],
  });
}
