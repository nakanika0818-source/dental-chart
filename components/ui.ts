// 画面全体で見た目をそろえるための共通の class

const BUTTON_BASE =
  "min-h-11 rounded-lg border px-4 py-2 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-60";

// 生成・コピー・上書き・消去など、その場で一番押してほしいボタン
export const PRIMARY_BUTTON = `${BUTTON_BASE} border-foreground bg-accent hover:enabled:bg-accent/80`;

// 取り消す・全文を選択・リセットの入口など、控えめにしたいボタン
export const SECONDARY_BUTTON = `${BUTTON_BASE} border-foreground/60 bg-surface hover:enabled:bg-notice`;

// 入力欄。枠は白地に対して読み取れる濃さにする
export const FIELD_CLASS =
  "mt-2 block w-full min-w-0 resize-y rounded-lg border border-foreground/60 bg-surface px-3 py-2 text-base leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

// 項目の下に添える説明文
export const HINT_CLASS = "mt-1 text-sm leading-relaxed";

// 確認を求める表示(上書き・リセット)
export const CONFIRM_BOX = "mt-4 rounded-lg border-2 border-foreground bg-notice p-3";

// 注意を促す表示(不足理由・古い下書き・コピー結果)
export const NOTICE_BOX = "mt-4 rounded-lg border-l-4 border-foreground bg-notice p-3";

// 補足的な案内(未生成・歯面を選ぶ前など)。上の余白は使う側で付ける
export const GUIDE_BOX =
  "rounded-lg border border-dashed border-foreground/60 bg-background p-3 text-base";
