import Section from "./Section";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  HINT_CLASS,
  CONFIRM_BOX,
  NOTICE_BOX,
  GUIDE_BOX,
  FIELD_CLASS,
} from "./ui";
import { validateForGenerate } from "@/lib/cr/buildDraft";
import { isDraftEdited, isDraftStale } from "@/lib/cr/draftState";
import type { DraftAction, DraftState } from "@/lib/cr/draftState";
import type { FormState } from "@/lib/cr/types";

type Props = {
  form: FormState;
  state: DraftState;
  dispatch: (action: DraftAction) => void;
  // コピーに失敗したとき、全文を選択するために使う
  textareaRef?: React.Ref<HTMLTextAreaElement>;
};

export default function DraftSection({
  form,
  state,
  dispatch,
  textareaRef,
}: Props) {
  // 理由は最後に押したときのものではなく、今の入力で判定し直す
  const reasons = state.showReasons ? validateForGenerate(form) : [];
  const stale = isDraftStale(form, state);
  const edited = isDraftEdited(state);

  return (
    <Section id="draft" step={5} title="下書き">
      <p className={HINT_CLASS}>
        入力内容を決まった形の文に並べます。入力していない内容は追加されません。
      </p>

      <button
        type="button"
        onClick={() => dispatch({ type: "generate", form })}
        className={`mt-4 ${PRIMARY_BUTTON}`}
      >
        {state.generatedDraft === null ? "下書きを生成" : "下書きを再生成"}
      </button>

      {reasons.length > 0 && (
        <div
          role="alert"
          className={NOTICE_BOX}
        >
          <p className="text-base font-bold">
            下書きを生成できません。次の必須項目を入力してください。
          </p>
          <ul className="mt-2 list-disc pl-6 text-base">
            {reasons.map((reason) => (
              <li key={reason} className="mt-1 break-words">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.confirmingOverwrite && (
        <div
          role="alert"
          className={CONFIRM_BOX}
        >
          <p className="text-base font-bold">
            手で編集した下書きが、入力内容から作り直した文章で上書きされます。上書きしますか?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "confirmOverwrite", form })}
              className={PRIMARY_BUTTON}
            >
              上書きして再生成
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "cancelOverwrite" })}
              className={SECONDARY_BUTTON}
            >
              取り消す(編集内容を残す)
            </button>
          </div>
        </div>
      )}

      {state.generatedDraft === null ? (
        <p className={`mt-4 ${GUIDE_BOX}`}>
          下書きはまだありません。「下書きを生成」を押すと、入力内容から作ります。
        </p>
      ) : (
        <>
          {stale && (
            <p
              role="status"
              className={`${NOTICE_BOX} text-base font-bold`}
            >
              古い下書きです。生成したあとで入力が変更されています。必要なら再生成してください。
            </p>
          )}
          <label className="mt-4 block">
            <span className="text-base font-bold">
              下書き(編集できます)
              {edited && (
                <span className="ml-2 font-normal">手で編集されています</span>
              )}
            </span>
            <textarea
              ref={textareaRef}
              rows={10}
              autoComplete="off"
              value={state.draft}
              onChange={(event) =>
                dispatch({ type: "edit", text: event.target.value })
              }
              className={FIELD_CLASS}
            />
          </label>
        </>
      )}
    </Section>
  );
}
