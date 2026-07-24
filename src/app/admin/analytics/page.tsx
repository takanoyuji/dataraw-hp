"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";

interface Stat {
  slug: string;
  title: string;
  views: number;
  reads: number;
  readRate: number;
}

export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsAdmin />
    </AdminGuard>
  );
}

function AnalyticsAdmin() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setStats(Array.isArray(d.stats) ? d.stats : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalViews = stats.reduce((a, s) => a + s.views, 0);
  const totalReads = stats.reduce((a, s) => a + s.reads, 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">記事アクセス・読了</h1>
      <p className="mb-8 text-sm text-gray-500">
        自前計測（日別ユニークの延べ）。表示＝記事を開いた数、読了＝末尾まで到達し10秒以上滞在した数。
        流入元など全体傾向は GA4 を参照。
      </p>

      {loading ? (
        <p className="text-gray-500">読み込み中…</p>
      ) : stats.length === 0 ? (
        <p className="text-gray-500">まだ計測データがありません。</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-gray-500">総表示</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-2xl font-bold">{totalReads.toLocaleString()}</div>
              <div className="text-xs text-gray-500">総読了</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-2xl font-bold">
                {totalViews ? Math.round((totalReads / totalViews) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-500">全体読了率</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-white/[0.05] text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">記事</th>
                  <th className="px-4 py-3 text-right font-semibold">表示</th>
                  <th className="px-4 py-3 text-right font-semibold">読了</th>
                  <th className="px-4 py-3 text-right font-semibold">読了率</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.slug} className="border-t border-white/[0.07]">
                    <td className="px-4 py-3">
                      <a
                        href={`/articles/${s.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-200 hover:text-blue-400"
                      >
                        {s.title}
                      </a>
                      <div className="text-xs text-gray-600">{s.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {s.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {s.reads.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {Math.round(s.readRate * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
