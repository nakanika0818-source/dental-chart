import Section from "./Section";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  HINT_CLASS,
  CONFIRM_BOX,
} from "./ui";
import type { DraftAction, DraftState } from "@/lib/cr/draftState";

type Props = {
  state: DraftState;
  dispatch: (action: DraftAction) => void;
  onReset: () => void;
};

export default function ResetSection({ state, dispatch, onReset }: Props) {
  return (
    <Section id="reset" step={7} title="リセット">
      <p className={HINT_CLASS}>
        コピーが終わったら、次の記録の前に入力と下書きを消去してください。
      </p>

      {state.confirmingReset ? (
        <div
          role="alert"
          className={CONFIRM_BOX}
        >
          <p className="text-base font-bold">
            入力・下書き・確認チェックをすべて消去します。元に戻せません。消去しますか?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReset}
              className={PRIMARY_BUTTON}
            >
              消去する
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "cancelReset" })}
              className={SECONDARY_BUTTON}
            >
              取り消す(消去しない)
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: "requestReset" })}
          className={`mt-4 ${SECONDARY_BUTTON}`}
        >
          入力と下書きをすべて消去
        </button>
      )}
    </Section>
  );
}
