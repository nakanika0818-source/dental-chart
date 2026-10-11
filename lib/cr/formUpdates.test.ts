import { describe, expect, it } from "vitest";
import { buildDraft } from "./buildDraft";
import { anesthesiaPatch } from "./formUpdates";
import { createEmptyForm } from "./types";
import type { Anesthesia, FormState } from "./types";

// テストの入力はすべて架空の情報
const withDetail: FormState = {
  ...createEmptyForm(),
  jaw: "upper",
  side: "right",
  toothNumber: 6,
  procedures: ["crFilling"],
  anesthesia: "used",
  anesthesiaDetail: "架空の麻酔薬 1.0mL",
};

const apply = (form: FormState, anesthesia: Anesthesia): FormState => ({
  ...form,
  ...anesthesiaPatch(anesthesia),
});

describe("anesthesiaPatch", () => {
  it("使用ありを選んでも、入力済みの詳細は消さない", () => {
    expect(apply(withDetail, "used").anesthesiaDetail).toBe("架空の麻酔薬 1.0mL");
  });

  it("使用なし・未確認に変えると詳細を消す", () => {
    expect(apply(withDetail, "notUsed").anesthesiaDetail).toBe("");
    expect(apply(withDetail, "unconfirmed").anesthesiaDetail).toBe("");
  });

  it("使用あり→使用なしに変えると、以前の詳細は下書きに出ない", () => {
    const draft = buildDraft(apply(withDetail, "notUsed"));
    expect(draft).toBe("部位:上顎右側6番\n処置:CR充填\n麻酔:使用なし");
  });

  it("使用あり→未確認に変えると、以前の詳細は下書きに出ない", () => {
    const draft = buildDraft(apply(withDetail, "unconfirmed"));
    expect(draft).toBe("部位:上顎右側6番\n処置:CR充填\n麻酔:未確認");
  });

  it("使用あり→使用なし→使用ありと戻しても、以前の詳細は復活しない", () => {
    const back = apply(apply(withDetail, "notUsed"), "used");
    expect(back.anesthesiaDetail).toBe("");
    expect(buildDraft(back)).toBe(
      "部位:上顎右側6番\n処置:CR充填\n麻酔:使用あり",
    );
  });

  it("麻酔以外の入力は変えない", () => {
    expect(apply(withDetail, "notUsed")).toEqual({
      ...withDetail,
      anesthesia: "notUsed",
      anesthesiaDetail: "",
    });
  });
});
