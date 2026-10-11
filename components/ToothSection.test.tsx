import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ToothSection from "./ToothSection";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 表示内容だけを確認する(クリック操作はブラウザで確認する)
function render(overrides: Partial<FormState> = {}): string {
  const form = { ...createEmptyForm(), ...overrides };
  return renderToStaticMarkup(<ToothSection form={form} onChange={() => {}} />);
}

const count = (html: string, pattern: RegExp) =>
  (html.match(pattern) ?? []).length;

const GUIDE = "先に歯の位置(上顎・下顎と番号)を選んでください。";

describe("ToothSection", () => {
  it("初期状態はすべて未選択で、歯面は選択できない", () => {
    const html = render();
    expect(count(html, /type="radio"/g)).toBe(12);
    expect(count(html, /type="checkbox"/g)).toBe(0);
    expect(count(html, /<input[^>]*\schecked/g)).toBe(0);
    expect(html).toContain(GUIDE);
  });

  it("上顎・下顎だけ、または番号だけでは歯面を選択できない", () => {
    for (const html of [
      render({ jaw: "upper" }),
      render({ toothNumber: 6 }),
      render({ side: "right", toothNumber: 6 }),
    ]) {
      expect(count(html, /type="checkbox"/g)).toBe(0);
      expect(html).toContain(GUIDE);
    }
  });

  it("上顎・下顎と番号が決まれば、左右が未選択でも歯面を選択できる", () => {
    const html = render({ jaw: "upper", toothNumber: 6 });
    expect(count(html, /type="checkbox"/g)).toBe(5);
    expect(html).not.toContain(GUIDE);
  });

  it("歯の位置に応じて歯面の名称が切り替わる", () => {
    const upperAnterior = render({ jaw: "upper", toothNumber: 1 });
    for (const label of ["近心", "遠心", "切縁", "唇側", "口蓋側"]) {
      expect(upperAnterior).toContain(label);
    }
    expect(upperAnterior).not.toContain("咬合面");
    expect(upperAnterior).not.toContain("頬側");
    expect(upperAnterior).not.toContain("舌側");

    const lowerPosterior = render({ jaw: "lower", toothNumber: 6 });
    for (const label of ["近心", "遠心", "咬合面", "頬側", "舌側"]) {
      expect(lowerPosterior).toContain(label);
    }
    expect(lowerPosterior).not.toContain("切縁");
    expect(lowerPosterior).not.toContain("唇側");
    expect(lowerPosterior).not.toContain("口蓋側");
  });

  it("選択した項目だけが選択中になり、歯面は複数選択できる", () => {
    const html = render({
      jaw: "lower",
      side: "left",
      toothNumber: 6,
      surfaces: ["mesial", "occlusal"],
    });
    expect(count(html, /type="radio"[^>]*\schecked/g)).toBe(3);
    expect(count(html, /type="checkbox"[^>]*\schecked/g)).toBe(2);
  });

  it("必須・任意を文字で表示する", () => {
    const html = render();
    expect(count(html, />必須</g)).toBe(3);
    expect(count(html, />任意</g)).toBe(1);
  });
});
