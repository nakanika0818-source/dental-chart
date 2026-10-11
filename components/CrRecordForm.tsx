"use client";

import { useState } from "react";
import ToothSection from "./ToothSection";
import { createEmptyForm } from "@/lib/cr/types";
import type { FormState } from "@/lib/cr/types";

// 入力は state だけで保持する。保存・外部送信・ログ出力はしない
export default function CrRecordForm() {
  const [form, setForm] = useState<FormState>(createEmptyForm);

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <ToothSection form={form} onChange={update} />
    </form>
  );
}
