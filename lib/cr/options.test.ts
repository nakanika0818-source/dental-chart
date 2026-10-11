import { describe, expect, it } from "vitest";
import {
  ANESTHESIA_OPTIONS,
  EXPLANATION_OPTIONS,
  PROCEDURE_OPTIONS,
  TOOTH_NUMBERS,
  getSurfaceLabels,
} from "./options";

describe("getSurfaceLabels", () => {
  it("前歯(1〜3)は近心・遠心・切縁・唇側になる", () => {
    for (const toothNumber of [1, 2, 3] as const) {
      const labels = getSurfaceLabels("upper", toothNumber);
      expect(labels.mesial).toBe("近心");
      expect(labels.distal).toBe("遠心");
      expect(labels.occlusal).toBe("切縁");
      expect(labels.buccal).toBe("唇側");
    }
  });

  it("臼歯(4〜8)は近心・遠心・咬合面・頬側になる", () => {
    for (const toothNumber of [4, 5, 6, 7, 8] as const) {
      const labels = getSurfaceLabels("lower", toothNumber);
      expect(labels.mesial).toBe("近心");
      expect(labels.distal).toBe("遠心");
      expect(labels.occlusal).toBe("咬合面");
      expect(labels.buccal).toBe("頬側");
    }
  });

  it("内側は上顎なら口蓋側、下顎なら舌側になる", () => {
    for (const toothNumber of TOOTH_NUMBERS) {
      expect(getSurfaceLabels("upper", toothNumber).lingual).toBe("口蓋側");
      expect(getSurfaceLabels("lower", toothNumber).lingual).toBe("舌側");
    }
  });
});

describe("確認済みの選択肢", () => {
  it("処置内容は確認済みの8項目がこの順で並ぶ", () => {
    expect(PROCEDURE_OPTIONS.map((option) => option.label)).toEqual([
      "齲蝕除去",
      "窩洞形成",
      "覆髄・裏層",
      "接着処理",
      "CR充填",
      "光照射",
      "形態修正・咬合調整",
      "研磨",
    ]);
  });

  it("麻酔は使用あり・使用なし・未確認の3つ", () => {
    expect(ANESTHESIA_OPTIONS.map((option) => option.label)).toEqual([
      "使用あり",
      "使用なし",
      "未確認",
    ]);
  });

  it("患者への説明は確認済みの5項目", () => {
    expect(EXPLANATION_OPTIONS.map((option) => option.label)).toEqual([
      "処置内容",
      "麻酔後の注意(飲食・咬傷)",
      "術後にしみる・痛む可能性",
      "咬み合わせに違和感があれば連絡",
      "着色・脱離の可能性",
    ]);
  });
});
