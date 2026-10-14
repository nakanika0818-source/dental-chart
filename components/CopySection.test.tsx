import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CopySection from "./CopySection";
import { draftReducer, initialDraftState } from "@/lib/cr/draftState";
import type { DraftAction, DraftState } from "@/lib/cr/draftState";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 表示内容だけを確認する(クリックとクリップボードの操作はブラウザで確認する)
function render(form: FormState, state: DraftState): string {
  return renderToStaticMarkup(
    <CopySection
      form={form}
      state={state}
      dispatch={() => {}}
      onSelectAll={() => {}}
    />,
  );
}

// テストの入力はすべて架空の情報
const valid: FormState = {
  ...createEmptyForm(),
  jaw: "lower",
  side: "right",
  toothNumber: 7,
  procedures: ["crFilling"],
};

const run = (state: DraftState, ...actions: DraftAction[]) =>
  actions.reduce(draftReducer, state);

const generated = run(initialDraftState, { type: "generate", form: valid });
const confirmed = run(generated, { type: "setConfirmed", confirmed: true });

const copyButton = (html: string) =>
  html.match(/<button[^>]*>下書きをコピー<\/button>/)?.[0] ?? "";
// class の disabled: と区別するため、属性だけを探す
const DISABLED = /\sdisabled=""/;
const checkbox = (html: string) =>
  html.match(/<input type="checkbox"[^>]*>/)?.[0] ?? "";

describe("CopySection", () => {
  it("未生成のときは、チェックもコピーもできない", () => {
    const html = render(createEmptyForm(), initialDraftState);
    expect(checkbox(html)).toMatch(DISABLED);
    expect(copyButton(html)).toMatch(DISABLED);
    expect(html).toContain("先に下書きを生成してください。");
  });

  it("生成直後はチェックが外れていて、コピーできない", () => {
    const html = render(valid, generated);
    expect(checkbox(html)).not.toMatch(DISABLED);
    expect(checkbox(html)).not.toMatch(/\schecked/);
    expect(copyButton(html)).toMatch(DISABLED);
    expect(html).toContain("にチェックを入れてください。");
  });

  it("確認済み・空でない・古くない下書きならコピーできる", () => {
    const html = render(valid, confirmed);
    expect(checkbox(html)).toMatch(/\schecked/);
    expect(copyButton(html)).not.toMatch(DISABLED);
    expect(html).not.toContain("まだコピーできません。");
  });

  it("古い下書きは、チェックを入れてもコピーできない", () => {
    const state = run(
      confirmed,
      { type: "inputChanged" },
      { type: "setConfirmed", confirmed: true },
    );
    const html = render({ ...valid, shade: "A2" }, state);
    expect(copyButton(html)).toMatch(DISABLED);
    expect(html).toContain("古い下書きです。再生成してください。");
  });

  it("コピー中はボタンを押せない", () => {
    const html = render(valid, run(confirmed, { type: "copyStarted" }));
    expect(copyButton(html)).toMatch(DISABLED);
    expect(html).toContain("コピーしています…");
  });

  it("成功を日本語で表示する", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const html = render(
      valid,
      run(started, { type: "copyFinished", version: started.version, ok: true }),
    );
    expect(html).toContain("コピーしました。");
    expect(html).not.toContain("全文を選択");
  });

  it("失敗を日本語で表示し、全文を選択するボタンを出す", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const html = render(
      valid,
      run(started, {
        type: "copyFinished",
        version: started.version,
        ok: false,
      }),
    );
    expect(html).toContain("コピーできませんでした。");
    expect(html).toContain(">全文を選択</button>");
    // 手動コピーの手順をパソコン・スマートフォンの両方について示す
    expect(html).toContain("Ctrl+C");
    expect(html).toContain("長押しして「コピー」");
    expect(html).toContain("貼り付け先で内容を確認する");
  });

  it("結果の表示は読み上げ用の領域に出す", () => {
    expect(render(valid, confirmed)).toMatch(/role="status"[^>]*aria-live="polite"/);
  });
});
