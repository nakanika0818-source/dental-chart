import { describe, expect, it } from "vitest";
import {
  draftReducer,
  initialDraftState,
  isDraftEdited,
  isDraftStale,
} from "./draftState";
import type { DraftAction, DraftState } from "./draftState";
import { createEmptyForm } from "./types";
import type { FormState } from "./types";

// テストの入力はすべて架空の情報
const valid: FormState = {
  ...createEmptyForm(),
  jaw: "upper",
  side: "right",
  toothNumber: 6,
  procedures: ["crFilling"],
};
const validDraft = "部位:上顎右側6番\n処置:CR充填";

const run = (state: DraftState, ...actions: DraftAction[]) =>
  actions.reduce(draftReducer, state);

const generated = run(initialDraftState, { type: "generate", form: valid });

describe("draftReducer:生成", () => {
  it("初期状態は未生成", () => {
    expect(initialDraftState).toEqual({
      draft: "",
      generatedDraft: null,
      confirmingOverwrite: false,
      showReasons: false,
      confirmed: false,
      copyStatus: "idle",
      version: 0,
      confirmingReset: false,
    });
  });

  it("必須項目がそろっていれば generateDraft の結果をそのまま表示する", () => {
    expect(generated).toMatchObject({
      draft: validDraft,
      generatedDraft: validDraft,
      confirmingOverwrite: false,
      showReasons: false,
      confirmed: false,
    });
  });

  it("必須項目が足りなければ生成せず、理由を表示する", () => {
    const state = run(initialDraftState, {
      type: "generate",
      form: createEmptyForm(),
    });
    expect(state.showReasons).toBe(true);
    expect(state.draft).toBe("");
    expect(state.generatedDraft).toBeNull();
  });

  it("生成済みでも、必須項目が足りなければ表示中の下書きを消さない", () => {
    const state = run(
      generated,
      { type: "edit", text: "手で直した下書き" },
      { type: "generate", form: { ...valid, side: null } },
    );
    expect(state.showReasons).toBe(true);
    expect(state.draft).toBe("手で直した下書き");
    expect(state.generatedDraft).toBe(validDraft);
    expect(state.confirmingOverwrite).toBe(false);
  });

  it("理由の表示は、生成に成功すると消える", () => {
    const state = run(
      initialDraftState,
      { type: "generate", form: createEmptyForm() },
      { type: "generate", form: valid },
    );
    expect(state.showReasons).toBe(false);
    expect(state.draft).toBe(validDraft);
  });
});

describe("draftReducer:編集と上書きの確認", () => {
  it("下書きを手で編集できる", () => {
    const state = run(generated, { type: "edit", text: "手で直した下書き" });
    expect(state.draft).toBe("手で直した下書き");
    expect(isDraftEdited(state)).toBe(true);
  });

  it("編集していなければ、再生成で確認を出さずに更新する", () => {
    const changed: FormState = { ...valid, shade: "A2" };
    const state = run(generated, { type: "generate", form: changed });
    expect(state.confirmingOverwrite).toBe(false);
    expect(state.draft).toBe(`${validDraft}\n色調:A2`);
  });

  it("編集後の再生成では、上書きせずに確認を出す", () => {
    const state = run(
      generated,
      { type: "edit", text: "手で直した下書き" },
      { type: "generate", form: valid },
    );
    expect(state.confirmingOverwrite).toBe(true);
    expect(state.draft).toBe("手で直した下書き");
  });

  it("上書きを取り消したら、編集内容を保持する", () => {
    const state = run(
      generated,
      { type: "edit", text: "手で直した下書き" },
      { type: "generate", form: valid },
      { type: "cancelOverwrite" },
    );
    expect(state.confirmingOverwrite).toBe(false);
    expect(state.draft).toBe("手で直した下書き");
    expect(state.generatedDraft).toBe(validDraft);
  });

  it("上書きに同意したら、確認時点の入力で生成し直す", () => {
    const changed: FormState = { ...valid, material: "架空レジンA" };
    const state = run(
      generated,
      { type: "edit", text: "手で直した下書き" },
      { type: "generate", form: valid },
      { type: "confirmOverwrite", form: changed },
    );
    expect(state.confirmingOverwrite).toBe(false);
    expect(state.draft).toBe(`${validDraft}\n材料:架空レジンA`);
    expect(state.generatedDraft).toBe(state.draft);
  });

  it("上書きの確認中に必須項目が足りなくなったら、上書きせず理由を表示する", () => {
    const state = run(
      generated,
      { type: "edit", text: "手で直した下書き" },
      { type: "generate", form: valid },
      { type: "confirmOverwrite", form: { ...valid, procedures: [] } },
    );
    expect(state.draft).toBe("手で直した下書き");
    expect(state.showReasons).toBe(true);
    expect(state.confirmingOverwrite).toBe(false);
  });

  it("編集して元の文章に戻したら、編集していない扱いになる", () => {
    const state = run(
      generated,
      { type: "edit", text: "手で直した下書き" },
      { type: "edit", text: validDraft },
      { type: "generate", form: valid },
    );
    expect(state.confirmingOverwrite).toBe(false);
  });

  it("下書きを空欄にしてからの再生成では、失う内容がないので確認しない", () => {
    const state = run(
      generated,
      { type: "edit", text: "  " },
      { type: "generate", form: valid },
    );
    expect(state.confirmingOverwrite).toBe(false);
    expect(state.draft).toBe(validDraft);
  });
});

describe("isDraftStale:古い下書きの判定", () => {
  it("未生成なら古い下書きではない", () => {
    expect(isDraftStale(valid, initialDraftState)).toBe(false);
  });

  it("生成時から入力が変わっていなければ古くない", () => {
    expect(isDraftStale(valid, generated)).toBe(false);
  });

  it("生成後に入力を変えたら古い下書きになる", () => {
    expect(isDraftStale({ ...valid, shade: "A3" }, generated)).toBe(true);
    expect(isDraftStale({ ...valid, anesthesia: "unconfirmed" }, generated)).toBe(
      true,
    );
  });

  it("生成後に必須項目を消しても古い下書きになる", () => {
    expect(isDraftStale({ ...valid, toothNumber: null }, generated)).toBe(true);
  });

  it("手で編集しただけでは古い下書きにならない", () => {
    const state = run(generated, { type: "edit", text: "手で直した下書き" });
    expect(isDraftStale(valid, state)).toBe(false);
  });

  it("下書きに影響しない違い(選択の順番)は古い扱いにしない", () => {
    const base = { ...valid, procedures: ["cariesRemoval", "crFilling"] } as FormState;
    const state = run(initialDraftState, { type: "generate", form: base });
    expect(
      isDraftStale({ ...base, procedures: ["crFilling", "cariesRemoval"] }, state),
    ).toBe(false);
  });

  it("再生成すると古い下書きではなくなる", () => {
    const changed: FormState = { ...valid, shade: "A3" };
    const state = run(generated, { type: "generate", form: changed });
    expect(isDraftStale(changed, state)).toBe(false);
  });
});
