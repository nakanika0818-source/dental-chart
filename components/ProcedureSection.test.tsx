import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProcedureSection from "./ProcedureSection";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 表示内容だけを確認する(クリック・入力の操作はブラウザで確認する)
function render(overrides: Partial<FormState> = {}): string {
  const form = { ...createEmptyForm(), ...overrides };
  return renderToStaticMarkup(
    <ProcedureSection form={form} onChange={() => {}} />,
  );
}

const count = (html: string, pattern: RegExp) =>
  (html.match(pattern) ?? []).length;

describe("ProcedureSection", () => {
  it("初期状態はすべて未選択・未入力", () => {
    const html = render();
    expect(count(html, /type="checkbox"/g)).toBe(8);
    expect(count(html, /type="radio"/g)).toBe(3);
    expect(count(html, /<input[^>]*\schecked/g)).toBe(0);
    expect(count(html, /type="text"[^>]*value=""/g)).toBe(2);
    expect(html).toMatch(/<textarea[^>]*><\/textarea>/);
  });

  it("確認済みの処置8項目と麻酔の3つの選択肢を表示する", () => {
    const html = render();
    for (const label of [
      "齲蝕除去",
      "窩洞形成",
      "覆髄・裏層",
      "接着処理",
      "CR充填",
      "光照射",
      "形態修正・咬合調整",
      "研磨",
      "使用あり",
      "使用なし",
      "未確認",
    ]) {
      expect(html).toContain(label);
    }
  });

  it("処置は複数選択できる", () => {
    const html = render({ procedures: ["cariesRemoval", "crFilling", "polishing"] });
    expect(count(html, /type="checkbox"[^>]*\schecked/g)).toBe(3);
  });

  it("麻酔の詳細欄は「使用あり」のときだけ表示する", () => {
    expect(render({ anesthesia: "used" })).toContain("麻酔の詳細");
    for (const anesthesia of [null, "notUsed", "unconfirmed"] as const) {
      expect(render({ anesthesia })).not.toContain("麻酔の詳細");
    }
  });

  it("麻酔は選んだ1つだけが選択中になる", () => {
    for (const anesthesia of ["used", "notUsed", "unconfirmed"] as const) {
      expect(
        count(render({ anesthesia }), /type="radio"[^>]*\schecked/g),
      ).toBe(1);
    }
  });

  it("材料と色調は別々の入力欄になる", () => {
    const html = render({ material: "架空レジンA", shade: "A2" });
    expect(html).toContain("使用材料");
    expect(html).toContain("色調");
    expect(html).toContain('value="架空レジンA"');
    expect(html).toContain('value="A2"');
  });

  it("入力欄はブラウザに入力履歴を残させない", () => {
    const html = render({ anesthesia: "used" });
    const fields = count(html, /type="text"/g) + count(html, /<textarea/g);
    expect(fields).toBe(4);
    expect(count(html, /autoComplete="off"/gi)).toBe(4);
  });
});
