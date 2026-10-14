import { describe, expect, it } from "vitest";
import { draftReducer, getCopyBlockers, initialDraftState } from "./draftState";
import type { DraftAction, DraftState } from "./draftState";
import { createEmptyForm } from "./types";
import type { FormState } from "./types";

// テストの入力はすべて架空の情報
const valid: FormState = {
  ...createEmptyForm(),
  jaw: "upper",
  side: "left",
  toothNumber: 4,
  procedures: ["crFilling"],
};

const run = (state: DraftState, ...actions: DraftAction[]) =>
  actions.reduce(draftReducer, state);

const generated = run(initialDraftState, { type: "generate", form: valid });
const confirmed = run(generated, { type: "setConfirmed", confirmed: true });

describe("確認チェック", () => {
  it("初期状態と生成直後は未確認", () => {
    expect(initialDraftState.confirmed).toBe(false);
    expect(generated.confirmed).toBe(false);
  });

  it("チェックを入れる・外すができる", () => {
    expect(confirmed.confirmed).toBe(true);
    expect(
      run(confirmed, { type: "setConfirmed", confirmed: false }).confirmed,
    ).toBe(false);
  });

  it("下書きを編集すると解除する", () => {
    expect(run(confirmed, { type: "edit", text: "架空の編集" }).confirmed).toBe(
      false,
    );
  });

  it("再生成すると解除する", () => {
    expect(
      run(confirmed, { type: "generate", form: { ...valid, shade: "A2" } })
        .confirmed,
    ).toBe(false);
  });

  it("同じ入力のまま再生成しても解除する", () => {
    expect(run(confirmed, { type: "generate", form: valid }).confirmed).toBe(
      false,
    );
  });

  it("上書きの確認を経て再生成しても解除する", () => {
    const edited = run(
      generated,
      { type: "edit", text: "架空の編集" },
      { type: "setConfirmed", confirmed: true },
      { type: "generate", form: valid },
    );
    // 確認を出している間は、まだ下書きが変わっていないので解除しない
    expect(edited.confirmingOverwrite).toBe(true);
    expect(edited.confirmed).toBe(true);
    expect(
      run(edited, { type: "confirmOverwrite", form: valid }).confirmed,
    ).toBe(false);
  });

  it("上書きを取り消したら、下書きは変わらないので解除しない", () => {
    const state = run(
      generated,
      { type: "edit", text: "架空の編集" },
      { type: "setConfirmed", confirmed: true },
      { type: "generate", form: valid },
      { type: "cancelOverwrite" },
    );
    expect(state.confirmed).toBe(true);
  });

  it("入力を変更すると解除する", () => {
    expect(run(confirmed, { type: "inputChanged" }).confirmed).toBe(false);
  });
});

describe("getCopyBlockers:コピーできる条件", () => {
  it("確認済み・空でない・古くない下書きならコピーできる", () => {
    expect(getCopyBlockers(valid, confirmed)).toEqual([]);
  });

  it("未生成ならコピーできない", () => {
    expect(getCopyBlockers(valid, initialDraftState)).toEqual([
      "先に下書きを生成してください。",
    ]);
  });

  it("確認チェックがなければコピーできない", () => {
    expect(getCopyBlockers(valid, generated)).toEqual([
      "「下書きの内容を確認した」にチェックを入れてください。",
    ]);
  });

  it("下書きが空(空白だけを含む)ならコピーできない", () => {
    const state = run(
      generated,
      { type: "edit", text: " \n " },
      { type: "setConfirmed", confirmed: true },
    );
    expect(getCopyBlockers(valid, state)).toEqual(["下書きが空です。"]);
  });

  it("古い下書きならコピーできない(チェックを入れ直しても)", () => {
    const changed: FormState = { ...valid, material: "架空レジンA" };
    const state = run(
      confirmed,
      { type: "inputChanged" },
      { type: "setConfirmed", confirmed: true },
    );
    expect(getCopyBlockers(changed, state)).toEqual([
      "古い下書きです。再生成してください。",
    ]);
  });

  it("再生成して確認し直せば、またコピーできる", () => {
    const changed: FormState = { ...valid, material: "架空レジンA" };
    const state = run(
      confirmed,
      { type: "inputChanged" },
      { type: "generate", form: changed },
      { type: "setConfirmed", confirmed: true },
    );
    expect(getCopyBlockers(changed, state)).toEqual([]);
  });

  it("手で編集した下書きも、確認すればコピーできる", () => {
    const state = run(
      generated,
      { type: "edit", text: "架空の編集" },
      { type: "setConfirmed", confirmed: true },
    );
    expect(getCopyBlockers(valid, state)).toEqual([]);
  });
});

describe("コピーの結果表示", () => {
  it("コピー中 → 成功を表示する", () => {
    const started = run(confirmed, { type: "copyStarted" });
    expect(started.copyStatus).toBe("copying");
    const done = run(started, {
      type: "copyFinished",
      version: started.version,
      ok: true,
    });
    expect(done.copyStatus).toBe("success");
  });

  it("コピー中 → 失敗を表示する", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const done = run(started, {
      type: "copyFinished",
      version: started.version,
      ok: false,
    });
    expect(done.copyStatus).toBe("failure");
  });

  it("コピー中に下書きを編集したら、古い内容の成功を表示しない", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const edited = run(started, { type: "edit", text: "架空の編集" });
    const done = run(edited, {
      type: "copyFinished",
      version: started.version,
      ok: true,
    });
    expect(done.copyStatus).toBe("idle");
    expect(done.confirmed).toBe(false);
  });

  it("コピー中に入力を変更したら、古い内容の成功を表示しない", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const done = run(
      started,
      { type: "inputChanged" },
      { type: "copyFinished", version: started.version, ok: true },
    );
    expect(done.copyStatus).toBe("idle");
  });

  it("コピー中に再生成したら、古い内容の成功を表示しない", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const done = run(
      started,
      { type: "generate", form: valid },
      { type: "copyFinished", version: started.version, ok: true },
    );
    expect(done.copyStatus).toBe("idle");
  });

  it("成功の表示は、そのあと下書きを編集すると消える", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const done = run(
      started,
      { type: "copyFinished", version: started.version, ok: true },
      { type: "edit", text: "架空の編集" },
    );
    expect(done.copyStatus).toBe("idle");
  });

  it("失敗の表示は、そのあと入力を変更すると消える", () => {
    const started = run(confirmed, { type: "copyStarted" });
    const done = run(
      started,
      { type: "copyFinished", version: started.version, ok: false },
      { type: "inputChanged" },
    );
    expect(done.copyStatus).toBe("idle");
  });
});
