import { describe, expect, it } from "vitest";
import { getMissingItems } from "./missingItems";
import { createEmptyForm } from "./types";
import type { FormState } from "./types";

// テストの入力はすべて架空の情報
function form(overrides: Partial<FormState> = {}): FormState {
  return { ...createEmptyForm(), ...overrides };
}

const keys = (items: { key: string }[]) => items.map((item) => item.key);

describe("getMissingItems", () => {
  it("初期状態では必須4項目と任意7項目が未入力で、確認項目はない", () => {
    const result = getMissingItems(form());
    expect(keys(result.required)).toEqual([
      "jaw",
      "side",
      "toothNumber",
      "procedures",
    ]);
    expect(result.needsConfirmation).toEqual([]);
    expect(keys(result.optional)).toEqual([
      "surfaces",
      "anesthesia",
      "material",
      "shade",
      "explanations",
      "nextVisit",
      "remarks",
    ]);
  });

  it("歯の位置は上下・左右・番号を別々に判定する", () => {
    const result = getMissingItems(form({ jaw: "upper", toothNumber: 6 }));
    expect(keys(result.required)).toEqual(["side", "procedures"]);
  });

  it("処置内容はチェック1つ以上で入力済みになる", () => {
    const result = getMissingItems(form({ procedures: ["crFilling"] }));
    expect(keys(result.required)).not.toContain("procedures");
  });

  it("処置内容は補足の記述だけでも入力済みになる", () => {
    const result = getMissingItems(form({ procedureNote: "架空の補足" }));
    expect(keys(result.required)).not.toContain("procedures");
  });

  it("空白だけの補足は未入力として扱う", () => {
    const result = getMissingItems(
      form({ procedureNote: "  \n ", material: " ", remarks: "\t" }),
    );
    expect(keys(result.required)).toContain("procedures");
    expect(keys(result.optional)).toContain("material");
    expect(keys(result.optional)).toContain("remarks");
  });

  it("歯面は未入力でも必須にせず、任意の一覧に出す", () => {
    const result = getMissingItems(
      form({
        jaw: "upper",
        side: "right",
        toothNumber: 6,
        procedures: ["crFilling"],
      }),
    );
    expect(result.required).toEqual([]);
    expect(keys(result.optional)).toContain("surfaces");
  });

  describe("麻酔", () => {
    it("未入力は任意の一覧に出し、確認項目にはしない", () => {
      const result = getMissingItems(form({ anesthesia: null }));
      expect(keys(result.optional)).toContain("anesthesia");
      expect(result.needsConfirmation).toEqual([]);
    });

    it("未確認は確認項目に出し、未入力とは区別する", () => {
      const result = getMissingItems(form({ anesthesia: "unconfirmed" }));
      expect(keys(result.needsConfirmation)).toEqual(["anesthesiaUnconfirmed"]);
      expect(keys(result.optional)).not.toContain("anesthesia");
    });

    it("使用なしは未入力にも確認項目にも出さない", () => {
      const result = getMissingItems(form({ anesthesia: "notUsed" }));
      expect(result.needsConfirmation).toEqual([]);
      expect(keys(result.optional)).not.toContain("anesthesia");
    });

    it("使用ありで詳細が空欄なら確認を促す", () => {
      const result = getMissingItems(form({ anesthesia: "used" }));
      expect(keys(result.needsConfirmation)).toEqual(["anesthesiaDetail"]);
      expect(keys(result.optional)).not.toContain("anesthesia");
    });

    it("使用ありで詳細があれば確認項目はない", () => {
      const result = getMissingItems(
        form({ anesthesia: "used", anesthesiaDetail: "架空の麻酔薬 1.0mL" }),
      );
      expect(result.needsConfirmation).toEqual([]);
    });

    it("確認項目は必須にしない(生成を妨げない)", () => {
      const result = getMissingItems(
        form({
          jaw: "lower",
          side: "left",
          toothNumber: 2,
          procedures: ["crFilling"],
          anesthesia: "used",
        }),
      );
      expect(result.required).toEqual([]);
      expect(keys(result.needsConfirmation)).toEqual(["anesthesiaDetail"]);
    });
  });

  it("患者への説明はチェックか自由記述のどちらかで入力済みになる", () => {
    expect(
      keys(getMissingItems(form({ explanations: ["procedure"] })).optional),
    ).not.toContain("explanations");
    expect(
      keys(getMissingItems(form({ explanationNote: "架空の説明" })).optional),
    ).not.toContain("explanations");
  });

  it("すべて入力すると3グループとも空になる", () => {
    const result = getMissingItems(
      form({
        jaw: "upper",
        side: "right",
        toothNumber: 6,
        surfaces: ["mesial"],
        procedures: ["crFilling"],
        anesthesia: "notUsed",
        material: "架空レジンA",
        shade: "A2",
        explanations: ["procedure"],
        nextVisit: "架空の予定",
        remarks: "架空の補足",
      }),
    );
    expect(result).toEqual({
      required: [],
      needsConfirmation: [],
      optional: [],
    });
  });
});
