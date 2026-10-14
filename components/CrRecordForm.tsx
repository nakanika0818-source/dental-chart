"use client";

import { useReducer, useRef, useState } from "react";
import CopySection from "./CopySection";
import DraftSection from "./DraftSection";
import ExplanationSection from "./ExplanationSection";
import MissingItemsSection from "./MissingItemsSection";
import ProcedureSection from "./ProcedureSection";
import ToothSection from "./ToothSection";
import { draftReducer, initialDraftState } from "@/lib/cr/draftState";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 入力と下書きは state だけで保持する。保存・外部送信・ログ出力はしない
export default function CrRecordForm() {
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [draftState, dispatchDraft] = useReducer(
    draftReducer,
    initialDraftState,
  );
  const draftRef = useRef<HTMLTextAreaElement>(null);

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    // 入力を変えたら、確認チェックとコピーの表示を取り消す
    dispatchDraft({ type: "inputChanged" });
  };

  const selectAllDraft = () => {
    const textarea = draftRef.current;
    if (textarea === null) {
      return;
    }
    textarea.focus();
    textarea.select();
    // iOS Safari は select() だけでは選択されないことがある
    textarea.setSelectionRange(0, textarea.value.length);
  };

  return (
    <form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
      <ToothSection form={form} onChange={update} />
      <ProcedureSection form={form} onChange={update} />
      <ExplanationSection form={form} onChange={update} />
      <MissingItemsSection form={form} />
      <DraftSection
        form={form}
        state={draftState}
        dispatch={dispatchDraft}
        textareaRef={draftRef}
      />
      <CopySection
        form={form}
        state={draftState}
        dispatch={dispatchDraft}
        onSelectAll={selectAllDraft}
      />
    </form>
  );
}
