import type {
  Anesthesia,
  ExplanationKey,
  Jaw,
  ProcedureKey,
  Side,
  SurfaceKey,
  ToothNumber,
} from "./types";

// 選択肢と必須項目はユーザー確認済みのもの(CLAUDE.md)。推測で足さない・変えない

export const JAW_LABELS: Record<Jaw, string> = {
  upper: "上顎",
  lower: "下顎",
};

export const SIDE_LABELS: Record<Side, string> = {
  right: "右側",
  left: "左側",
};

export const TOOTH_NUMBERS: readonly ToothNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

// 下書きにはこの順で出す
export const SURFACE_KEYS: readonly SurfaceKey[] = [
  "mesial",
  "distal",
  "occlusal",
  "buccal",
  "lingual",
];

export function isAnteriorTooth(toothNumber: ToothNumber): boolean {
  return toothNumber <= 3;
}

export function getSurfaceLabels(
  jaw: Jaw,
  toothNumber: ToothNumber,
): Record<SurfaceKey, string> {
  const anterior = isAnteriorTooth(toothNumber);
  return {
    mesial: "近心",
    distal: "遠心",
    occlusal: anterior ? "切縁" : "咬合面",
    buccal: anterior ? "唇側" : "頬側",
    lingual: jaw === "upper" ? "口蓋側" : "舌側",
  };
}

// 下書きにはクリック順ではなくこの順で出す
export const PROCEDURE_OPTIONS: readonly { key: ProcedureKey; label: string }[] =
  [
    { key: "cariesRemoval", label: "齲蝕除去" },
    { key: "cavityPreparation", label: "窩洞形成" },
    { key: "pulpCappingLining", label: "覆髄・裏層" },
    { key: "bonding", label: "接着処理" },
    { key: "crFilling", label: "CR充填" },
    { key: "lightCuring", label: "光照射" },
    { key: "contouringOcclusalAdjustment", label: "形態修正・咬合調整" },
    { key: "polishing", label: "研磨" },
  ];

export const ANESTHESIA_OPTIONS: readonly { key: Anesthesia; label: string }[] =
  [
    { key: "used", label: "使用あり" },
    { key: "notUsed", label: "使用なし" },
    { key: "unconfirmed", label: "未確認" },
  ];

export const ANESTHESIA_LABELS: Record<Anesthesia, string> = {
  used: "使用あり",
  notUsed: "使用なし",
  unconfirmed: "未確認",
};

// 講座用の候補。下書きには選択した項目名だけを出す
export const EXPLANATION_OPTIONS: readonly {
  key: ExplanationKey;
  label: string;
}[] = [
  { key: "procedure", label: "処置内容" },
  { key: "anesthesiaCaution", label: "麻酔後の注意(飲食・咬傷)" },
  { key: "postoperativePain", label: "術後にしみる・痛む可能性" },
  { key: "occlusionDiscomfort", label: "咬み合わせに違和感があれば連絡" },
  { key: "stainingDebonding", label: "着色・脱離の可能性" },
];
