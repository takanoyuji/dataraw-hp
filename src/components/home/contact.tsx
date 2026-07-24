"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";
import { toast } from "sonner";

export function Contact() {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (res.ok) {
        toast.success("送信しました。お問い合わせありがとうございます。");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error("送信に失敗しました。時間をおいて再度お試しください。");
      }
    } catch {
      toast.error("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="py-24 section-dark relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[200px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader
            title="お問い合わせ"
            subtitle="データ活用に関するご相談、お見積もり依頼など、お気軽にお問い合わせください。専門スタッフが丁寧にご対応いたします。"
          />
        </ScrollAnimation>

        <ScrollAnimation>
          <div className="max-w-3xl mx-auto">
            {/* Form card */}
            <div className="glass-card p-8 md:p-10 relative">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm text-gray-300">
                      お名前 <span className="text-blue-400">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="name"
                      required
                      className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-sm text-gray-300">
                      会社名 <span className="text-blue-400">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="company"
                      name="company"
                      autoComplete="organization"
                      required
                      className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                      placeholder="株式会社○○"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm text-gray-300">
                      メールアドレス <span className="text-blue-400">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      spellCheck={false}
                      required
                      className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                      placeholder="info@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm text-gray-300">
                      電話番号
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                      placeholder="03-1234-5678"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm text-gray-300">
                    件名 <span className="text-blue-400">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    autoComplete="off"
                    required
                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                    placeholder="データ分析のご相談"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm text-gray-300">
                    お問い合わせ内容 <span className="text-blue-400">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
                    placeholder="ご相談内容をご記入ください"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="privacy"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-400">
                    <Link
                      href="/privacy-policy"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      プライバシーポリシー
                    </Link>
                    に同意します
                  </label>
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto px-10 py-3 h-auto rounded-full gradient-btn text-white font-medium text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {sending ? (
                      "送信中..."
                    ) : (
                      <span className="flex items-center gap-2">
                        送信する
                        <Send className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
