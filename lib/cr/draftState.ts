import { buildDraft, generateDraft } from "./buildDraft";
import { isBlank } from "./missingItems";
import type { FormState } from "./types";

export type DraftState = {
  // テキスト欄に表示している文章(手で編集した内容を含む)
  draft: string;
  // 最後に生成した文章。未生成なら null
  generatedDraft: string | null;
  // 手で編集した下書きを上書きしてよいか確認している間 true
  confirmingOverwrite: boolean;
  // 生成しようとして必須項目が足りなかったとき true
  showReasons: boolean;
};

export type DraftAction =
  | { type: "generate"; form: FormState }
  | { type: "confirmOverwrite"; form: FormState }
  | { type: "cancelOverwrite" }
  | { type: "edit"; text: string };

export const initialDraftState: DraftState = {
  draft: "",
  generatedDraft: null,
  confirmingOverwrite: false,
  showReasons: false,
};

export function isDraftEdited(state: DraftState): boolean {
  return state.generatedDraft !== null && state.draft !== state.generatedDraft;
}

// 生成後に入力を変えたかどうか。選択の順番など、下書きに影響しない違いは無視する
export function isDraftStale(form: FormState, state: DraftState): boolean {
  return (
    state.generatedDraft !== null && buildDraft(form) !== state.generatedDraft
  );
}

function regenerate(state: DraftState, form: FormState): DraftState {
  const result = generateDraft(form);
  if (!result.ok) {
    // 生成できないときは、表示中の下書きに手を付けない
    return { ...state, confirmingOverwrite: false, showReasons: true };
  }
  return {
    draft: result.draft,
    generatedDraft: result.draft,
    confirmingOverwrite: false,
    showReasons: false,
  };
}

export function draftReducer(
  state: DraftState,
  action: DraftAction,
): DraftState {
  switch (action.type) {
    case "generate": {
      if (!generateDraft(action.form).ok) {
        return regenerate(state, action.form);
      }
      // 手で編集した内容は、確認を取ってから上書きする(空欄なら失うものがないので確認しない)
      if (isDraftEdited(state) && !isBlank(state.draft)) {
        return { ...state, confirmingOverwrite: true, showReasons: false };
      }
      return regenerate(state, action.form);
    }
    case "confirmOverwrite":
      return regenerate(state, action.form);
    case "cancelOverwrite":
      return { ...state, confirmingOverwrite: false };
    case "edit":
      return { ...state, draft: action.text };
  }
}
