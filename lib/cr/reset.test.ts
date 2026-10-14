import { describe, expect, it } from "vitest";
import { draftReducer, initialDraftState } from "./draftState";
import type { DraftAction, DraftState } from "./draftState";
import { createEmptyForm } from "./types";
import type { FormState } from "./types";

// テストの入力はすべて架空の情報
const valid: FormState = {
  ...createEmptyForm(),
  jaw: "lower",
  side: "left",
  toothNumber: 5,
  procedures: ["crFilling"],
};

const run = (state: DraftState, ...actions: DraftAction[]) =>
  actions.reduce(draftReducer, state);

// 生成・編集・確認・コピー成功まで進めた状態
const started = run(
  initialDraftState,
  { type: "generate", form: valid },
  { type: "edit", text: "架空の編集" },
  { type: "setConfirmed", confirmed: true },
  { type: "copyStarted" },
);
const copied = run(started, {
  type: "copyFinished",
  version: started.version,
  ok: true,
});

// version 以外を比べるため、version をそろえる
const withoutVersion = (state: DraftState): DraftState => ({
  ...state,
  version: 0,
});

describe("リセットの確認", () => {
  it("リセットを押すと確認を表示し、まだ何も消さない", () => {
    const state = run(copied, { type: "requestReset" });
    expect(state.confirmingReset).toBe(true);
    expect(withoutVersion({ ...state, confirmingReset: false })).toEqual(
      withoutVersion(copied),
    );
  });

  it("取り消したら、下書き・確認チェック・コピー結果を保持する", () => {
    const state = run(copied, { type: "requestReset" }, { type: "cancelReset" });
    expect(state).toEqual(copied);
  });

  it("取り消しても version は変わらない(コピーの結果を捨てない)", () => {
    const state = run(started, { type: "requestReset" }, { type: "cancelReset" });
    expect(
      run(state, { type: "copyFinished", version: started.version, ok: true })
        .copyStatus,
    ).toBe("success");
  });
});

describe("リセットの実行", () => {
  it("下書き・確認チェック・コピー結果・リセットの確認をすべて初期化する", () => {
    const state = run(copied, { type: "requestReset" }, { type: "reset" });
    expect(withoutVersion(state)).toEqual(withoutVersion(initialDraftState));
  });

  it("不足理由の表示と上書きの確認も初期化する", () => {
    const withReasons = run(
      initialDraftState,
      { type: "generate", form: valid },
      { type: "edit", text: "架空の編集" },
      { type: "generate", form: createEmptyForm() },
    );
    expect(withReasons.showReasons).toBe(true);
    const overwriting = run(withReasons, { type: "generate", form: valid });
    expect(overwriting.confirmingOverwrite).toBe(true);

    for (const before of [withReasons, overwriting]) {
      const state = run(before, { type: "requestReset" }, { type: "reset" });
      expect(state.showReasons).toBe(false);
      expect(state.confirmingOverwrite).toBe(false);
      expect(state.draft).toBe("");
      expect(state.generatedDraft).toBeNull();
    }
  });

  it("コピー中にリセットしたら、遅れて返った成功を表示しない", () => {
    const state = run(
      started,
      { type: "requestReset" },
      { type: "reset" },
      { type: "copyFinished", version: started.version, ok: true },
    );
    expect(state.copyStatus).toBe("idle");
  });

  it("コピー中にリセットしたら、遅れて返った失敗も表示しない", () => {
    const state = run(
      started,
      { type: "requestReset" },
      { type: "reset" },
      { type: "copyFinished", version: started.version, ok: false },
    );
    expect(state.copyStatus).toBe("idle");
  });

  it("version が 0 のうちに始めたコピーでも、リセット後の結果は表示しない", () => {
    // version を 0 に戻す実装だと、ここで結果が一致してしまう
    const early = { ...initialDraftState, copyStatus: "copying" as const };
    const state = run(
      early,
      { type: "reset" },
      { type: "copyFinished", version: 0, ok: true },
    );
    expect(state.copyStatus).toBe("idle");
  });

  it("リセット後は、また最初から生成・確認・コピーできる", () => {
    const state = run(
      copied,
      { type: "reset" },
      { type: "generate", form: valid },
      { type: "setConfirmed", confirmed: true },
      { type: "copyStarted" },
    );
    const done = run(state, {
      type: "copyFinished",
      version: state.version,
      ok: true,
    });
    expect(done.copyStatus).toBe("success");
  });
});
