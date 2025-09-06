import express from "express";
import { messagingApi, validateSignature } from "@line/bot-sdk";
import { sources, fetchGymInfo } from "./sources.js";

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

  const userMessage = event.message.text;
  let replyText = "";

  // 查詢場館數據
  const results = await Promise.all(sources.map(fetchGymInfo));
  const gyms = results.flat();

  // 根據關鍵字匹配
  const matchedGym = gyms.find((gym) => gym.name.includes(userMessage));

  if (matchedGym) {
    replyText = `${matchedGym.name} 當前人數 ${matchedGym.gymCurrent}/${matchedGym.gymMax}`;
  } else {
    replyText = "找不到相關場館，請輸入關鍵字如「南港」或「南港運動中心」。";
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
