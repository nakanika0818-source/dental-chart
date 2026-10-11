import { describe, expect, it } from "vitest";
import { buildDraft, generateDraft, validateForGenerate } from "./buildDraft";
import { createEmptyForm } from "./types";
import type { FormState } from "./types";

// テストの入力はすべて架空の情報
function form(overrides: Partial<FormState> = {}): FormState {
  return { ...createEmptyForm(), ...overrides };
}

// 必須項目だけを入れた最小の入力
const minimal: Partial<FormState> = {
  jaw: "upper",
  side: "right",
  toothNumber: 6,
  procedures: ["crFilling"],
};

describe("buildDraft:入力の反映", () => {
  it("すべて入力すると固定の順で全行が出る", () => {
    const draft = buildDraft(
      form({
        jaw: "upper",
        side: "right",
        toothNumber: 6,
        surfaces: ["mesial", "occlusal"],
        procedures: ["cariesRemoval", "bonding", "crFilling", "polishing"],
        procedureNote: "架空の処置補足",
        anesthesia: "used",
        anesthesiaDetail: "架空の麻酔薬 1.0mL",
        material: "架空レジンA",
        shade: "A2",
        explanations: ["postoperativePain", "occlusionDiscomfort"],
        explanationNote: "架空の説明補足",
        nextVisit: "架空の次回予定",
        remarks: "架空の補足",
      }),
    );
    expect(draft).toBe(
      [
        "部位:上顎右側6番 近心・咬合面",
        "処置:齲蝕除去、接着処理、CR充填、研磨",
        "処置補足:架空の処置補足",
        "麻酔:使用あり(架空の麻酔薬 1.0mL)",
        "材料:架空レジンA",
        "色調:A2",
        "説明した項目:術後にしみる・痛む可能性、咬み合わせに違和感があれば連絡",
        "説明補足:架空の説明補足",
        "次回予定:架空の次回予定",
        "補足:架空の補足",
      ].join("\n"),
    );
  });

  it("処置内容はクリック順ではなく決まった順で出す", () => {
    const draft = buildDraft(
      form({
        ...minimal,
        procedures: ["polishing", "crFilling", "cariesRemoval"],
      }),
    );
    expect(draft).toContain("処置:齲蝕除去、CR充填、研磨");
  });

  it("歯面も選択順ではなく決まった順で出す", () => {
    const draft = buildDraft(
      form({ ...minimal, surfaces: ["lingual", "occlusal", "mesial"] }),
    );
    expect(draft).toContain("部位:上顎右側6番 近心・咬合面・口蓋側");
  });

  it("自由記述は前後の空白だけを除いてそのまま出す", () => {
    const draft = buildDraft(form({ ...minimal, material: "  架空レジンB \n" }));
    expect(draft).toContain("材料:架空レジンB");
  });
});

describe("buildDraft:入力していない事実を追加しない", () => {
  it("必須項目だけなら部位と処置の2行だけになる", () => {
    expect(buildDraft(form(minimal))).toBe("部位:上顎右側6番\n処置:CR充填");
  });

  it("未入力の項目は行ごと出さない", () => {
    const draft = buildDraft(form(minimal));
    for (const label of [
      "処置補足",
      "麻酔",
      "材料",
      "色調",
      "説明",
      "次回予定",
      "補足",
    ]) {
      expect(draft).not.toContain(label);
    }
  });

  it("「異常なし」「説明済み」「未入力」などの文言を補わない", () => {
    const draft = buildDraft(form(minimal));
    for (const word of ["異常なし", "説明済み", "問題なし", "未入力", "なし"]) {
      expect(draft).not.toContain(word);
    }
  });

  it("空白だけの自由記述は未入力として扱い、行を出さない", () => {
    const draft = buildDraft(
      form({
        ...minimal,
        procedureNote: "   ",
        material: "\n",
        shade: " ",
        explanationNote: "\t",
        nextVisit: "  ",
        remarks: " \n ",
      }),
    );
    expect(draft).toBe("部位:上顎右側6番\n処置:CR充填");
  });

  it("処置が補足の記述だけなら「処置:」の行は出さない", () => {
    const draft = buildDraft(
      form({ ...minimal, procedures: [], procedureNote: "架空の処置補足" }),
    );
    expect(draft).toBe("部位:上顎右側6番\n処置補足:架空の処置補足");
  });

  it("説明は選択した項目名だけを出し、注意事項の文章を補わない", () => {
    const draft = buildDraft(
      form({ ...minimal, explanations: ["anesthesiaCaution"] }),
    );
    expect(draft).toBe(
      "部位:上顎右側6番\n処置:CR充填\n説明した項目:麻酔後の注意(飲食・咬傷)",
    );
  });

  it("入力が空なら下書きも空になる", () => {
    expect(buildDraft(form())).toBe("");
  });
});

describe("buildDraft:麻酔の4状態", () => {
  it("未入力なら麻酔の行を出さない", () => {
    expect(buildDraft(form({ ...minimal, anesthesia: null }))).not.toContain(
      "麻酔",
    );
  });

  it("使用ありで詳細があれば詳細をかっこ書きで出す", () => {
    const draft = buildDraft(
      form({
        ...minimal,
        anesthesia: "used",
        anesthesiaDetail: "架空の麻酔薬 1.0mL",
      }),
    );
    expect(draft).toContain("麻酔:使用あり(架空の麻酔薬 1.0mL)");
  });

  it("使用ありで詳細が空欄なら「使用あり」だけを出す", () => {
    const draft = buildDraft(form({ ...minimal, anesthesia: "used" }));
    expect(draft.split("\n")).toContain("麻酔:使用あり");
  });

  it("使用なしは「使用なし」と出す", () => {
    const draft = buildDraft(form({ ...minimal, anesthesia: "notUsed" }));
    expect(draft.split("\n")).toContain("麻酔:使用なし");
  });

  it("未確認は「未確認」と出し、使用なしや使用ありに丸めない", () => {
    const draft = buildDraft(form({ ...minimal, anesthesia: "unconfirmed" }));
    expect(draft.split("\n")).toContain("麻酔:未確認");
    expect(draft).not.toContain("使用なし");
    expect(draft).not.toContain("使用あり");
  });

  it("4状態の出力はすべて異なる", () => {
    const drafts = ([null, "used", "notUsed", "unconfirmed"] as const).map(
      (anesthesia) => buildDraft(form({ ...minimal, anesthesia })),
    );
    expect(new Set(drafts).size).toBe(4);
  });

  it("使用あり以外では、残っている詳細の文字を出さない", () => {
    for (const anesthesia of ["notUsed", "unconfirmed", null] as const) {
      const draft = buildDraft(
        form({ ...minimal, anesthesia, anesthesiaDetail: "架空の麻酔薬" }),
      );
      expect(draft).not.toContain("架空の麻酔薬");
    }
  });
});

describe("buildDraft:歯の位置による歯面名の切り替え", () => {
  const allSurfaces: FormState["surfaces"] = [
    "mesial",
    "distal",
    "occlusal",
    "buccal",
    "lingual",
  ];
  const base: Partial<FormState> = {
    side: "left",
    surfaces: allSurfaces,
    procedures: ["crFilling"],
  };

  it("上顎の前歯:切縁・唇側・口蓋側", () => {
    const draft = buildDraft(form({ ...base, jaw: "upper", toothNumber: 1 }));
    expect(draft).toContain("部位:上顎左側1番 近心・遠心・切縁・唇側・口蓋側");
  });

  it("下顎の前歯:切縁・唇側・舌側", () => {
    const draft = buildDraft(form({ ...base, jaw: "lower", toothNumber: 3 }));
    expect(draft).toContain("部位:下顎左側3番 近心・遠心・切縁・唇側・舌側");
  });

  it("上顎の臼歯:咬合面・頬側・口蓋側", () => {
    const draft = buildDraft(form({ ...base, jaw: "upper", toothNumber: 4 }));
    expect(draft).toContain("部位:上顎左側4番 近心・遠心・咬合面・頬側・口蓋側");
  });

  it("下顎の臼歯:咬合面・頬側・舌側", () => {
    const draft = buildDraft(form({ ...base, jaw: "lower", toothNumber: 8 }));
    expect(draft).toContain("部位:下顎左側8番 近心・遠心・咬合面・頬側・舌側");
  });

  it("同じ選択のまま歯を変えると、名称だけが切り替わる", () => {
    const selected: Partial<FormState> = {
      ...base,
      surfaces: ["occlusal", "buccal"],
      jaw: "upper",
    };
    expect(buildDraft(form({ ...selected, toothNumber: 3 }))).toContain(
      "上顎左側3番 切縁・唇側",
    );
    expect(buildDraft(form({ ...selected, toothNumber: 4 }))).toContain(
      "上顎左側4番 咬合面・頬側",
    );
  });

  it("歯面が未入力なら歯の位置だけを出す", () => {
    const draft = buildDraft(form({ ...base, surfaces: [], jaw: "lower", toothNumber: 5 }));
    expect(draft.split("\n")[0]).toBe("部位:下顎左側5番");
  });
});

describe("validateForGenerate / generateDraft:必須項目のチェック", () => {
  it("何も入力していなければ、不足している項目をすべて理由として返す", () => {
    expect(validateForGenerate(form())).toEqual([
      "歯の位置(上顎・下顎)が未入力です",
      "歯の位置(右・左)が未入力です",
      "歯の位置(番号)が未入力です",
      "処置内容が未入力です",
    ]);
  });

  it("歯の位置が一部でも欠けていれば生成しない", () => {
    const result = generateDraft(form({ ...minimal, side: null }));
    expect(result).toEqual({
      ok: false,
      reasons: ["歯の位置(右・左)が未入力です"],
    });
  });

  it("処置内容がなければ生成しない", () => {
    const result = generateDraft(form({ ...minimal, procedures: [] }));
    expect(result).toEqual({ ok: false, reasons: ["処置内容が未入力です"] });
  });

  it("必須項目がそろえば、任意項目が空欄でも生成できる", () => {
    expect(generateDraft(form(minimal))).toEqual({
      ok: true,
      draft: "部位:上顎右側6番\n処置:CR充填",
    });
  });

  it("処置内容は補足の記述だけでも生成できる", () => {
    const result = generateDraft(
      form({ ...minimal, procedures: [], procedureNote: "架空の処置補足" }),
    );
    expect(result.ok).toBe(true);
  });

  it("歯面が未入力でも生成できる", () => {
    expect(validateForGenerate(form({ ...minimal, surfaces: [] }))).toEqual([]);
  });

  it("麻酔が未確認、または使用ありで詳細が空欄でも生成は妨げない", () => {
    expect(
      generateDraft(form({ ...minimal, anesthesia: "unconfirmed" })).ok,
    ).toBe(true);
    expect(generateDraft(form({ ...minimal, anesthesia: "used" })).ok).toBe(
      true,
    );
  });
});
