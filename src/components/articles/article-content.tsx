"use client";

import { Children, cloneElement, isValidElement, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import type { Root as MdastRoot, Text as MdastText } from "mdast";

/**
 * 日本語の約物（。「」等）に隣接した **強調** は CommonMark のフランキング規則で
 * 認識されず、生の `**` が本文に出てしまう。フランキングを無視して単純に
 * `**...**` を strong に変換する。コード内は text ノードに現れないので安全。
 */
function remarkCjkStrong() {
  return (tree: MdastRoot) => {
    visit(tree, "text", (node: MdastText, index, parent) => {
      if (!parent || index === undefined) return;
      // 既に強調内のテキストは触らない
      if (parent.type === "strong" || parent.type === "emphasis") return;
      if (!node.value.includes("**")) return;

      const parts: (MdastText | { type: "strong"; children: MdastText[] })[] = [];
      const regex = /\*\*(.+?)\*\*/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(node.value)) !== null) {
        if (m.index > last)
          parts.push({ type: "text", value: node.value.slice(last, m.index) });
        parts.push({ type: "strong", children: [{ type: "text", value: m[1] }] });
        last = m.index + m[0].length;
      }
      if (parts.length === 0) return;
      if (last < node.value.length)
        parts.push({ type: "text", value: node.value.slice(last) });

      parent.children.splice(index, 1, ...(parts as MdastText[]));
      return index + parts.length;
    });
  };
}

/**
 * blockquote の先頭段落が **太字** で始まっていたら「囲み」として扱う。
 *   > **連載: ...**   → 連載ナビ
 *   > **気づいたこと** → コールアウト
 * それ以外の blockquote は通常の引用のまま。
 */
function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "blockquote") return;

      const firstP = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "p"
      );
      const strong = firstP?.children[0];
      if (
        !firstP ||
        !strong ||
        strong.type !== "element" ||
        strong.tagName !== "strong"
      )
        return;

      const title = toText(strong);
      if (!title) return;

      // 太字が「見出しとして1行で完結している」ときだけ囲みにする。
      // 太字の直後に同じ行の本文が続く場合は、ただの強調なので通常の引用のまま。
      const after = firstP.children[1];
      const isHeadingLine =
        firstP.children.length === 1 ||
        (after?.type === "text" && /^\s*\n/.test(after.value));
      if (!isHeadingLine) return;

      // タイトル部分を本文から取り除く（直後の改行も）
      firstP.children.splice(0, 1);
      if (firstP.children[0]?.type === "text") {
        firstP.children[0].value = firstP.children[0].value.replace(/^\s*\n?/, "");
      }
      if (firstP.children.length === 0) {
        node.children = node.children.filter((c) => c !== firstP);
      }

      node.tagName = "div";
      node.properties = {
        ...node.properties,
        dataCallout: calloutVariant(title),
        dataCalloutTitle: title,
      };
    });
  };
}

function calloutVariant(title: string): string {
  if (title.startsWith("連載")) return "series";
  if (/次回|最終回|持ち越/.test(title)) return "teaser";
  return "insight";
}

/**
 * ```compare フェンスを Before / After の2カラムカードにする。
 *   ```compare
 *   ### Before: 素のFable 5
 *   - 市場規模の数字なし
 *   ### After: 型を仕込んだClaude Code
 *   - 市場規模・成長率を出典付きで記載
 *   ```
 * 1枚目を before(赤系)、2枚目以降を after(緑系) として扱う。
 * rehype-highlight より前に走らせて、未知の言語を渡さないようにする。
 */
function rehypeCompare() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;
      const code = node.children[0];
      if (code?.type !== "element" || code.tagName !== "code") return;

      const className = code.properties?.className;
      const languages = Array.isArray(className) ? className.map(String) : [];
      if (!languages.includes("language-compare")) return;

      const cards = parseCompare(toText(code));
      if (cards.length === 0) return;

      node.tagName = "div";
      node.children = [];
      node.properties = { dataCompare: JSON.stringify(cards) };
    });
  };
}

/**
 * ```stats フェンスを、大きい数字を並べた指標カードにする。
 *   ```stats
 *   ### 5工程
 *   7工程のうち自動化しうる工程
 *   企画・タイトル/サムネイル・構成/台本・撮影/編集・分析改善
 *   ```
 * `### 値` の次の行がラベル、それ以降が補足。調査系の記事で
 * 根拠の数字を冒頭に置くために使う。compare と同じく highlight より前に走らせる。
 */
function rehypeStats() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;
      const code = node.children[0];
      if (code?.type !== "element" || code.tagName !== "code") return;

      const className = code.properties?.className;
      const languages = Array.isArray(className) ? className.map(String) : [];
      if (!languages.includes("language-stats")) return;

      const cards = parseStats(toText(code));
      if (cards.length === 0) return;

      node.tagName = "div";
      node.children = [];
      node.properties = { dataStats: JSON.stringify(cards) };
    });
  };
}

interface StatCard {
  value: string;
  label: string;
  note: string;
}

function parseStats(raw: string): StatCard[] {
  return raw
    .split(/^###\s+/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [value, label = "", ...rest] = block.split("\n");
      return {
        value: value.trim(),
        label: label.trim(),
        note: rest.join(" ").trim(),
      };
    })
    .filter((card) => card.value && card.label);
}

/**
 * サブヘッドの直後（サブヘッドが無ければ H2 の直後）にある、太字だけの段落を
 * その章の主張＝メッセージラインとして扱い、枠付きで見せる。
 *   ## 業務の7工程分解 …
 *   *この章で扱うこと*
 *   **「YouTubeコンサル」はひとつの仕事ではない。**
 * 章の切れ目で「何を言う章か」を立たせるための層。段落全体が strong 1つの
 * ときだけ拾うので、文中の強調は巻き込まない。
 */
function rehypeMessageLines() {
  const markChildren = (parent: Root | Element) => {
    const elements = (parent.children as { type: string }[]).filter(
      (c): c is Element => c.type === "element"
    );
    elements.forEach((child, i) => {
      if (child.tagName !== "p") return;
      const prev = elements[i - 1];
      const afterHeading = prev?.tagName === "h2";
      const afterSubhead =
        prev?.tagName === "div" && prev.properties?.dataSubhead === "true";
      if (!afterHeading && !afterSubhead) return;

      const inner = child.children.filter(
        (c) => c.type !== "text" || c.value.trim()
      );
      if (inner.length !== 1) return;
      const strong = inner[0];
      if (strong.type !== "element" || strong.tagName !== "strong") return;

      child.tagName = "div";
      child.properties = { ...child.properties, dataMessage: "true" };
      child.children = strong.children;
    });
  };

  return (tree: Root) => {
    markChildren(tree);
    visit(tree, "element", markChildren);
  };
}

/**
 * 「## 01 業務の7工程分解 …」のように H2 が番号で始まっていたら、
 * 番号を章のアンカーとして切り出す。番号が無い H2 はそのまま。
 */
function rehypeChapterNumbers() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2") return;
      const first = node.children[0];
      if (first?.type !== "text") return;
      const m = /^(\d{1,2}|要約|出典)\s+([\s\S]+)$/.exec(first.value);
      if (!m) return;

      first.value = m[2];
      node.properties = { ...node.properties, dataChapter: m[1] };
    });
  };
}

/**
 * H2 の直後にあるイタリックだけの段落を、章の内容を示すサブヘッドとして扱う。
 *   ## 業務の7工程分解 自動化しやすさと、成否を決める工程のずれ
 *   *国内の運用支援サービスの提供範囲と料金体系から業務を7工程に分ける*
 * 日本語ではイタリックを他に使わないので、マーカーとして安全に使える。
 * 段落の中身が em 1つだけ、かつ直前が h2 のときに限る。
 */
function rehypeSubheads() {
  const markChildren = (parent: Root | Element) => {
    // Root と Element で children の型が違い、union のままだと型述語が効かない
    const elements = (parent.children as { type: string }[]).filter(
      (c): c is Element => c.type === "element"
    );
    elements.forEach((child, i) => {
      if (child.tagName !== "p") return;
      if (elements[i - 1]?.tagName !== "h2") return;
      const inner = child.children.filter(
        (c) => c.type !== "text" || c.value.trim()
      );
      if (inner.length !== 1) return;
      const em = inner[0];
      if (em.type !== "element" || em.tagName !== "em") return;

      child.tagName = "div";
      child.properties = { ...child.properties, dataSubhead: "true" };
      child.children = em.children;
    });
  };

  return (tree: Root) => {
    // 本文の h2 / p は root 直下に並ぶので、root 自身も走査対象に含める。
    markChildren(tree);
    visit(tree, "element", markChildren);
  };
}

interface CompareCard {
  label: string;
  items: string[];
}

function parseCompare(raw: string): CompareCard[] {
  return raw
    .split(/^###\s+/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [label, ...rest] = block.split("\n");
      return {
        label: label.trim(),
        items: rest
          .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
          .filter(Boolean),
      };
    })
    .filter((card) => card.items.length > 0);
}

function toText(node: Element | { type: string; value?: string }): string {
  if (node.type === "text") return (node as { value: string }).value;
  if (node.type === "element")
    return (node as Element).children.map((c) => toText(c as Element)).join("");
  return "";
}

/** 「← いまここ」を現在地バッジに置き換える */
function withCurrentBadge(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string" && child.includes("← いまここ")) {
      return (
        <>
          {child.replace(/\s*←\s*いまここ\s*/, "")}
          <span className="ml-2 align-middle rounded bg-[#2563eb] px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
            いまここ
          </span>
        </>
      );
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, {
        children: withCurrentBadge(child.props.children),
      });
    }
    return child;
  });
}

const components: Components = {
  h2: ({ children, ...props }) => {
    const chapter = (props as Record<string, unknown>)["data-chapter"] as
      | string
      | undefined;
    return (
      <h2 className="mt-14 mb-5 flex scroll-mt-24 items-baseline gap-3 border-b-2 border-gray-200 pb-3 text-xl font-bold tracking-tight text-[#1a2332] first:mt-0 md:text-2xl">
        {chapter && (
          <span className="shrink-0 text-[0.72em] font-extrabold tracking-[0.06em] text-[#2563eb]">
            {chapter}
          </span>
        )}
        <span>{children}</span>
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-9 mb-3 text-lg font-bold text-gray-800">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-7 mb-2 font-bold text-gray-700">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="my-5 text-[1.02rem] leading-[1.85] text-gray-700">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-[#1a2332]">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#2563eb] underline decoration-[#2563eb]/30 underline-offset-4 transition-colors hover:decoration-[#2563eb]"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-2.5 pl-6 text-gray-700 marker:text-[#2563eb]/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-2.5 pl-6 text-gray-700 marker:text-gray-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 leading-[1.85] [&>p]:my-1">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-r-lg border-l-4 border-gray-300 bg-gray-50 px-5 py-4 text-[0.97rem] leading-[1.9] text-gray-600 [&>p]:my-2 [&>p]:text-gray-600">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-7 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[480px] border-collapse text-[0.9rem]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  th: ({ children }) => (
    <th className="whitespace-nowrap border-b border-gray-300 px-4 py-3 text-left text-[0.85rem] font-bold text-[#1a2332]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-gray-200 px-4 py-3 align-top text-gray-700">
      {children}
    </td>
  ),
  tr: ({ children }) => <tr className="even:bg-gray-50/60">{children}</tr>,
  hr: () => <hr className="my-12 border-gray-200" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      className="my-7 w-full rounded-lg border border-gray-200"
    />
  ),
  code: ({ className, children, ...props }) => {
    // 言語指定のあるコードブロックに加え、改行を含む＝複数行のコードもブロック扱いにする。
    // （言語なしフェンス ``` はclassNameが付かず、放置するとインライン用スタイルが当たって
    //  暗い<pre>の中に白帯＋薄字が出て可読性が落ちる。ファイルツリー等がこれに該当。）
    const isBlock =
      /language-/.test(className ?? "") || String(children).includes("\n");
    if (isBlock)
      return (
        <code className={`${className ?? ""} text-[0.86rem]`} {...props}>
          {children}
        </code>
      );
    return (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.86em] text-[#1a2332]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-[#0d1526] p-5 leading-relaxed">
      {children}
    </pre>
  ),
  div: ({ children, ...props }) => {
    const attrs = props as Record<string, unknown>;
    const variant = attrs["data-callout"] as string | undefined;
    const title = attrs["data-callout-title"] as string | undefined;
    const compare = attrs["data-compare"] as string | undefined;
    const stats = attrs["data-stats"] as string | undefined;
    const subhead = attrs["data-subhead"] as string | undefined;

    if (attrs["data-message"]) {
      return (
        <div className="my-6 rounded-r-lg border-l-4 border-[#2563eb] bg-white px-5 py-4 text-[1.02rem] font-bold leading-[1.8] text-[#1a2332] shadow-sm ring-1 ring-black/5">
          {children}
        </div>
      );
    }

    if (subhead) {
      return (
        <div className="-mt-3 mb-6 text-[0.88rem] leading-[1.8] text-gray-500">
          {children}
        </div>
      );
    }

    if (stats) {
      const cards = JSON.parse(stats) as StatCard[];
      return (
        <div
          className={`my-8 grid gap-4 ${
            cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
        >
          {cards.map((card) => (
            <div
              key={card.value + card.label}
              className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4"
            >
              <div className="text-[0.78rem] leading-[1.6] text-gray-500">
                {card.label}
              </div>
              <div className="my-1 text-[1.75rem] font-extrabold leading-tight tracking-tight text-[#1a2332]">
                {card.value}
              </div>
              {card.note && (
                <div className="text-[0.8rem] leading-[1.7] text-gray-500">
                  {card.note}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (compare) {
      const cards = JSON.parse(compare) as CompareCard[];
      return (
        <div className="my-8 grid gap-4 md:grid-cols-2">
          {cards.map((card, i) => {
            const isAfter = i > 0;
            return (
              <div
                key={card.label}
                className={`rounded-xl border px-5 py-5 ${
                  isAfter
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div
                  className={`mb-3 text-[0.78rem] font-bold tracking-[0.05em] ${
                    isAfter ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {card.label}
                </div>
                <ul className="space-y-1.5 text-[0.9rem] leading-[1.8] text-gray-700">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        className={isAfter ? "text-emerald-600" : "text-red-500"}
                      >
                        {isAfter ? "✓" : "×"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      );
    }

    if (variant === "series") {
      return (
        <div className="my-8 rounded-xl border border-gray-200 bg-gray-100 px-6 py-5 text-[0.92rem]">
          {title && (
            <div className="mb-3 font-bold text-[#1a2332]">{title}</div>
          )}
          <div className="text-gray-600 [&_a]:text-[#2563eb] [&_li]:leading-[1.9] [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:my-0">
            {withCurrentBadge(children)}
          </div>
        </div>
      );
    }

    if (variant === "teaser") {
      return (
        <div className="mt-12 border-t-2 border-gray-200 pt-7">
          {title && (
            <div className="mb-2 text-[0.75rem] font-bold tracking-[0.08em] text-gray-500">
              {title}
            </div>
          )}
          <div className="text-[0.95rem] leading-[1.9] text-gray-600 [&>p]:my-2 [&>p]:text-gray-600">
            {children}
          </div>
        </div>
      );
    }

    if (variant === "insight") {
      return (
        <div className="my-8 rounded-lg border-l-4 border-[#2563eb] bg-[#eff6ff] px-6 py-5">
          {title && (
            <div className="mb-2 text-[0.78rem] font-bold tracking-[0.08em] text-[#2563eb]">
              {title}
            </div>
          )}
          <div className="text-[0.97rem] leading-[1.9] text-gray-700 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-2 [&>p]:text-gray-700">
            {children}
          </div>
        </div>
      );
    }

    return <div {...props}>{children}</div>;
  },
};

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="article-body max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCjkStrong]}
        rehypePlugins={[
          rehypeCallouts,
          rehypeCompare,
          rehypeStats,
          rehypeChapterNumbers,
          rehypeSubheads,
          rehypeMessageLines,
          rehypeHighlight,
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
