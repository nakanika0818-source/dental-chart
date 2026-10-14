import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DraftSection from "./DraftSection";
import { draftReducer, initialDraftState } from "@/lib/cr/draftState";
import type { DraftState } from "@/lib/cr/draftState";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 表示内容だけを確認する(クリック・入力の操作はブラウザで確認する)
function render(form: FormState, state: DraftState): string {
  return renderToStaticMarkup(
    <DraftSection form={form} state={state} dispatch={() => {}} />,
  );
}

// テストの入力はすべて架空の情報
const valid: FormState = {
  ...createEmptyForm(),
  jaw: "lower",
  side: "left",
  toothNumber: 2,
  procedures: ["crFilling"],
};
const generated = draftReducer(initialDraftState, {
  type: "generate",
  form: valid,
});

describe("DraftSection", () => {
  it("未生成のときは案内だけを表示し、テキスト欄はない", () => {
    const html = render(createEmptyForm(), initialDraftState);
    expect(html).toContain("下書きを生成");
    expect(html).toContain("下書きはまだありません。");
    expect(html).not.toContain("<textarea");
    expect(html).not.toContain('role="alert"');
  });

  it("必須項目が足りずに生成できなかったら、不足理由を表示する", () => {
    const state = draftReducer(initialDraftState, {
      type: "generate",
      form: createEmptyForm(),
    });
    const html = render(createEmptyForm(), state);
    expect(html).toContain("下書きを生成できません。");
    expect(html).toContain("歯の位置(上顎・下顎)が未入力です");
    expect(html).toContain("処置内容が未入力です");
  });

  it("不足理由は今の入力で判定し、入力した項目は消える", () => {
    const state = draftReducer(initialDraftState, {
      type: "generate",
      form: createEmptyForm(),
    });
    const html = render({ ...createEmptyForm(), jaw: "upper" }, state);
    expect(html).not.toContain("歯の位置(上顎・下顎)が未入力です");
    expect(html).toContain("歯の位置(右・左)が未入力です");
  });

  it("不足理由をすべて入力したら、理由の表示は消える", () => {
    const state = draftReducer(initialDraftState, {
      type: "generate",
      form: createEmptyForm(),
    });
    expect(render(valid, state)).not.toContain("下書きを生成できません。");
  });

  it("生成後は、生成した文章を編集できるテキスト欄に表示する", () => {
    const html = render(valid, generated);
    expect(html).toContain("下書き(編集できます)");
    expect(html).toContain(">部位:下顎左側2番\n処置:CR充填</textarea>");
    expect(html).toContain("下書きを再生成");
    expect(html).not.toContain("手で編集されています");
  });

  it("手で編集したら、その旨を表示する", () => {
    const state = draftReducer(generated, { type: "edit", text: "架空の編集" });
    const html = render(valid, state);
    expect(html).toContain(">架空の編集</textarea>");
    expect(html).toContain("手で編集されています");
  });

  it("編集後に再生成すると、上書きの確認を表示する", () => {
    const state = [
      { type: "edit", text: "架空の編集" } as const,
      { type: "generate", form: valid } as const,
    ].reduce(draftReducer, generated);
    const html = render(valid, state);
    expect(html).toContain("上書きしますか?");
    expect(html).toContain("上書きして再生成");
    expect(html).toContain("取り消す(編集内容を残す)");
    expect(html).toContain(">架空の編集</textarea>");
  });

  it("生成後に入力を変えたら、古い下書きであることを表示する", () => {
    expect(render(valid, generated)).not.toContain("古い下書きです。");
    expect(render({ ...valid, shade: "A2" }, generated)).toContain(
      "古い下書きです。",
    );
  });

  it("下書きの欄はブラウザに入力履歴を残させない", () => {
    expect(render(valid, generated)).toMatch(/<textarea[^>]*autoComplete="off"/i);
  });
});
