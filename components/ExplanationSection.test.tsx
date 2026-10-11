import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExplanationSection from "./ExplanationSection";
import { buildDraft } from "@/lib/cr/buildDraft";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 表示内容だけを確認する(クリック・入力の操作はブラウザで確認する)
function render(overrides: Partial<FormState> = {}): string {
  const form = { ...createEmptyForm(), ...overrides };
  return renderToStaticMarkup(
    <ExplanationSection form={form} onChange={() => {}} />,
  );
}

const count = (html: string, pattern: RegExp) =>
  (html.match(pattern) ?? []).length;

describe("ExplanationSection", () => {
  it("初期状態はすべて未選択・空欄", () => {
    const html = render();
    expect(count(html, /type="checkbox"/g)).toBe(5);
    expect(count(html, /<input[^>]*\schecked/g)).toBe(0);
    expect(count(html, /type="text"[^>]*value=""/g)).toBe(1);
    expect(count(html, /<textarea[^>]*><\/textarea>/g)).toBe(2);
  });

  it("確認済みの説明5項目を表示する", () => {
    const html = render();
    for (const label of [
      "処置内容",
      "麻酔後の注意(飲食・咬傷)",
      "術後にしみる・痛む可能性",
      "咬み合わせに違和感があれば連絡",
      "着色・脱離の可能性",
    ]) {
      expect(html).toContain(label);
    }
  });

  it("説明は複数選択できる", () => {
    const html = render({
      explanations: ["procedure", "postoperativePain", "stainingDebonding"],
    });
    expect(count(html, /type="checkbox"[^>]*\schecked/g)).toBe(3);
  });

  it("項目はすべて任意と表示し、必須の表示はない", () => {
    const html = render();
    expect(count(html, />任意</g)).toBe(4);
    expect(html).not.toContain(">必須<");
  });

  it("説明の補足・次回予定・その他の所見は別々の入力欄になる", () => {
    const html = render({
      explanationNote: "架空の説明補足",
      nextVisit: "架空の次回予定",
      remarks: "架空の所見",
    });
    expect(html).toContain("説明内容の補足");
    expect(html).toContain("次回予定");
    expect(html).toContain("その他の所見・補足");
    expect(html).toContain(">架空の説明補足</textarea>");
    expect(html).toContain('value="架空の次回予定"');
    expect(html).toContain(">架空の所見</textarea>");
  });

  it("入力欄はブラウザに入力履歴を残させない", () => {
    expect(count(render(), /autoComplete="off"/gi)).toBe(3);
  });
});

describe("説明の入力と下書き", () => {
  const base: FormState = {
    ...createEmptyForm(),
    jaw: "upper",
    side: "right",
    toothNumber: 6,
    procedures: ["crFilling"],
  };

  it("選択した項目名だけが出て、説明の具体的な文章は追加されない", () => {
    const draft = buildDraft({
      ...base,
      explanations: ["anesthesiaCaution", "occlusionDiscomfort"],
    });
    expect(draft).toBe(
      [
        "部位:上顎右側6番",
        "処置:CR充填",
        "説明した項目:麻酔後の注意(飲食・咬傷)、咬み合わせに違和感があれば連絡",
      ].join("\n"),
    );
  });

  it("説明・次回予定・補足が空なら、それらの行は出ない", () => {
    expect(buildDraft(base)).toBe("部位:上顎右側6番\n処置:CR充填");
  });
});
