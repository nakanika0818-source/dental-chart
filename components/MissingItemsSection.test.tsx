import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MissingItemsSection from "./MissingItemsSection";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// テストの入力はすべて架空の情報
function render(overrides: Partial<FormState> = {}): string {
  const form = { ...createEmptyForm(), ...overrides };
  return renderToStaticMarkup(<MissingItemsSection form={form} />);
}

// 見出しの直後にある件数を取り出す
function countOf(html: string, heading: string): number {
  const match = html.match(
    new RegExp(`${heading}<span[^>]*>\\(([0-9]+)件\\)</span>`),
  );
  if (match === null) {
    throw new Error(`見出しが見つかりません:${heading}`);
  }
  return Number(match[1]);
}

const filled: Partial<FormState> = {
  jaw: "upper",
  side: "right",
  toothNumber: 6,
  surfaces: ["mesial"],
  procedures: ["crFilling"],
  anesthesia: "notUsed",
  material: "架空レジンA",
  shade: "A2",
  explanations: ["procedure"],
  nextVisit: "架空の予定",
  remarks: "架空の所見",
};

describe("MissingItemsSection", () => {
  it("3グループを見出しの文字で区別して表示する", () => {
    const html = render();
    expect(html).toContain("必須項目の未入力");
    expect(html).toContain("確認してください");
    expect(html).toContain("任意項目の未入力");
    expect(html).toContain("入力するまで下書きを生成できません。");
    expect(html).toContain("空欄のままでも下書きを生成できます。エラーではありません。");
  });

  it("初期状態では必須4件・確認0件・任意7件", () => {
    const html = render();
    expect(countOf(html, "必須項目の未入力")).toBe(4);
    expect(countOf(html, "確認してください")).toBe(0);
    expect(countOf(html, "任意項目の未入力")).toBe(7);
    for (const label of [
      "歯の位置(上顎・下顎)",
      "歯の位置(右・左)",
      "歯の位置(番号)",
      "処置内容",
      "歯面",
      "使用材料",
      "その他の所見・補足",
    ]) {
      expect(html).toContain(`>${label}</li>`);
    }
  });

  it("入力すると該当の項目が一覧から消える", () => {
    const html = render({ jaw: "upper", toothNumber: 6, material: "架空レジンA" });
    expect(countOf(html, "必須項目の未入力")).toBe(2);
    expect(html).not.toContain(">歯の位置(上顎・下顎)</li>");
    expect(html).not.toContain(">使用材料</li>");
  });

  it("麻酔が未確認なら「確認してください」に出す", () => {
    const html = render({ anesthesia: "unconfirmed" });
    expect(countOf(html, "確認してください")).toBe(1);
    expect(html).toContain(">麻酔(未確認になっています)</li>");
    expect(html).not.toContain(">麻酔</li>");
  });

  it("麻酔が使用ありで詳細が空欄なら「確認してください」に出す", () => {
    const html = render({ anesthesia: "used" });
    expect(countOf(html, "確認してください")).toBe(1);
    expect(html).toContain(">麻酔の詳細(使用ありですが、詳細が未入力です)</li>");
  });

  it("麻酔が使用ありで詳細があれば確認項目はない", () => {
    const html = render({ anesthesia: "used", anesthesiaDetail: "架空の麻酔薬" });
    expect(countOf(html, "確認してください")).toBe(0);
  });

  it("麻酔が未入力なら任意の一覧に出し、確認項目にはしない", () => {
    const html = render();
    expect(html).toContain(">麻酔</li>");
    expect(countOf(html, "確認してください")).toBe(0);
  });

  it("すべて入力すると3グループとも0件になり、その旨を表示する", () => {
    const html = render(filled);
    expect(countOf(html, "必須項目の未入力")).toBe(0);
    expect(countOf(html, "確認してください")).toBe(0);
    expect(countOf(html, "任意項目の未入力")).toBe(0);
    expect(html).toContain("必須項目の未入力はありません。");
    expect(html).not.toContain("<li");
  });

  it("医学的な完全性を保証しない旨を常に表示する", () => {
    const notice =
      "この一覧は入力欄の空欄を示すもので、記録の医学的な完全性を保証するものではありません。";
    expect(render()).toContain(notice);
    expect(render(filled)).toContain(notice);
  });

  it("「完了」「問題なし」など完全性を示す文言を出さない", () => {
    const html = render(filled);
    for (const word of ["完了", "問題なし", "異常なし", "完璧", "すべて入力済み"]) {
      expect(html).not.toContain(word);
    }
  });
});
