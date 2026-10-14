import { validateForGenerate } from "@/lib/cr/buildDraft";
import { isDraftEdited, isDraftStale } from "@/lib/cr/draftState";
import type { DraftAction, DraftState } from "@/lib/cr/draftState";
import type { FormState } from "@/lib/cr/types";

type Props = {
  form: FormState;
  state: DraftState;
  dispatch: (action: DraftAction) => void;
};

const BUTTON_CLASS =
  "min-h-11 rounded-lg border border-foreground px-4 py-2 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export default function DraftSection({ form, state, dispatch }: Props) {
  // 理由は最後に押したときのものではなく、今の入力で判定し直す
  const reasons = state.showReasons ? validateForGenerate(form) : [];
  const stale = isDraftStale(form, state);
  const edited = isDraftEdited(state);

  return (
    <section
      aria-labelledby="draft-heading"
      className="mt-6 rounded-lg border border-accent bg-surface p-4"
    >
      <h2 id="draft-heading" className="text-xl font-bold">
        下書き
      </h2>
      <p className="mt-1 text-sm">
        入力内容を決まった形の文に並べます。入力していない内容は追加されません。
      </p>

      <button
        type="button"
        onClick={() => dispatch({ type: "generate", form })}
        className={`mt-4 bg-accent ${BUTTON_CLASS}`}
      >
        {state.generatedDraft === null ? "下書きを生成" : "下書きを再生成"}
      </button>

      {reasons.length > 0 && (
        <div
          role="alert"
          className="mt-4 rounded-lg border-l-4 border-foreground bg-notice p-3"
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
          className="mt-4 rounded-lg border-2 border-foreground bg-notice p-3"
        >
          <p className="text-base font-bold">
            手で編集した下書きが、入力内容から作り直した文章で上書きされます。上書きしますか?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "confirmOverwrite", form })}
              className={`bg-accent ${BUTTON_CLASS}`}
            >
              上書きして再生成
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "cancelOverwrite" })}
              className={`bg-surface ${BUTTON_CLASS}`}
            >
              取り消す(編集内容を残す)
            </button>
          </div>
        </div>
      )}

      {state.generatedDraft === null ? (
        <p className="mt-4 rounded-lg border border-dashed border-foreground/40 p-3 text-base">
          下書きはまだありません。「下書きを生成」を押すと、入力内容から作ります。
        </p>
      ) : (
        <>
          {stale && (
            <p
              role="status"
              className="mt-4 rounded-lg border-l-4 border-foreground bg-notice p-3 text-base font-bold"
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
              rows={10}
              autoComplete="off"
              value={state.draft}
              onChange={(event) =>
                dispatch({ type: "edit", text: event.target.value })
              }
              className="mt-2 block w-full min-w-0 rounded-lg border border-foreground/30 bg-surface px-3 py-2 text-base leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            />
          </label>
        </>
      )}
    </section>
  );
}
