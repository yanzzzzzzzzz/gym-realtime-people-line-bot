import express from "express";
import cors from "cors";

// Node 18+ 原生有 fetch，無需額外安裝
const TAIPEI_ENDPOINT =
  "https://booking-tpsc.sporetrofit.com/Home/loadLocationPeopleNum";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

/**
 * 直連官方 API，POST 空 JSON {}
 * 回傳原始 JSON（內含每館的健身房/泳池人數與容留）
 */
app.get("/api/taipei/people", async (_req, res) => {
  try {
    const resp = await fetch(TAIPEI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res
        .status(resp.status)
        .json({ error: "upstream_error", status: resp.status, body: text });
    }

    const data = await resp.json();
    // 你也可以在這裡先做簡單轉換，只留健身房欄位
    // 例如：
    // const simplified = data.locationPeopleNums?.map((x: any) => ({
    //   id: x.LID,
    //   name: x.lidName,
    //   gymCurrent: Number(x.gymPeopleNum ?? 0),
    //   gymMax: Number(x.gymMaxPeopleNum ?? 0),
    //   poolCurrent: Number(x.swPeopleNum ?? 0),
    //   poolMax: Number(x.swMaxPeopleNum ?? 0),
    // }));
    // return res.json({ items: simplified });

    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "fetch_failed", message: err?.message ?? String(err) });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
