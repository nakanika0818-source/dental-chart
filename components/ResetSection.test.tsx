import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ResetSection from "./ResetSection";
import { draftReducer, initialDraftState } from "@/lib/cr/draftState";
import type { DraftState } from "@/lib/cr/draftState";

// 表示内容だけを確認する(クリックの操作はブラウザで確認する)
function render(state: DraftState): string {
  return renderToStaticMarkup(
    <ResetSection state={state} dispatch={() => {}} onReset={() => {}} />,
  );
}

describe("ResetSection", () => {
  it("最初はリセットのボタンだけを表示し、確認は出さない", () => {
    const html = render(initialDraftState);
    expect(html).toContain(">入力と下書きをすべて消去</button>");
    expect(html).not.toContain("消去しますか?");
    expect(html).not.toContain('role="alert"');
  });

  it("リセットを押すと、画面内に確認を表示する", () => {
    const html = render(
      draftReducer(initialDraftState, { type: "requestReset" }),
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("元に戻せません。消去しますか?");
    expect(html).toContain(">消去する</button>");
    expect(html).toContain(">取り消す(消去しない)</button>");
    expect(html).not.toContain(">入力と下書きをすべて消去</button>");
  });
});
