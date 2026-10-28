/** サーバーの起動時に1回だけ動く。新人しごとシミュレーターのトライアル終了前の知らせを1時間ごとに見る */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { notifyTrialEnds } = await import("@/lib/shinjin/signup");
  const tick = () => notifyTrialEnds().catch((e) => console.error("[shinjin] 終了前の知らせの確認に失敗:", e instanceof Error ? e.message : e));
  setTimeout(tick, 60_000);
  setInterval(tick, 3600_000);
}
