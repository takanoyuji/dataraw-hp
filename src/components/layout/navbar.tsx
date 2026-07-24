"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "ホーム" },
  { href: "/about", label: "会社概要" },
  { href: "/ds", label: "データサイエンス" },
  { href: "/lp", label: "Web開発" },
  { href: "/articles", label: "ブログ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold gradient-text tracking-tight hover:opacity-80 transition-opacity"
            >
              DataRaw LLC
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={isHome && link.href === "/" ? "#home" : link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-blue-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </Link>
              );
            })}
            <Link
              href={isHome ? "#contact" : "/#contact"}
              className="ml-4 px-5 py-2 rounded-full gradient-btn text-sm font-medium text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              お問い合わせ
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                aria-label="メニューを開く"
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/95 backdrop-blur-xl border-white/10 w-72">
                <SheetTitle className="gradient-text text-lg font-bold mb-8">
                  DataRaw LLC
                </SheetTitle>
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-lg transition-all text-base ${
                          isActive
                            ? "text-blue-400 bg-blue-500/10"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="pt-4">
                    <Link
                      href={isHome ? "#contact" : "/#contact"}
                      onClick={() => setOpen(false)}
                      className="block px-6 py-3 rounded-full gradient-btn text-center text-white font-medium"
                    >
                      お問い合わせ
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
