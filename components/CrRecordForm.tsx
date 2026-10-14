"use client";

import { useReducer, useState } from "react";
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

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  return (
    <form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
      <ToothSection form={form} onChange={update} />
      <ProcedureSection form={form} onChange={update} />
      <ExplanationSection form={form} onChange={update} />
      <MissingItemsSection form={form} />
      <DraftSection form={form} state={draftState} dispatch={dispatchDraft} />
    </form>
  );
}
