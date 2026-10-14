import Badge from "./Badge";
import ChoiceChip from "./ChoiceChip";
import Section from "./Section";
import TextField from "./TextField";
import { HINT_CLASS } from "./ui";
import { anesthesiaPatch } from "@/lib/cr/formUpdates";
import { ANESTHESIA_OPTIONS, PROCEDURE_OPTIONS } from "@/lib/cr/options";
import type { FormState, ProcedureKey } from "@/lib/cr/types";

type Props = {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
};

export default function ProcedureSection({ form, onChange }: Props) {
  const toggleProcedure = (key: ProcedureKey) => {
    onChange({
      procedures: form.procedures.includes(key)
        ? form.procedures.filter((procedure) => procedure !== key)
        : [...form.procedures, key],
    });
  };

  return (
    <Section id="procedure" step={2} title="処置内容">
      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          実施した処置(複数選択できます)
          <Badge>必須</Badge>
        </legend>
        <p className={HINT_CLASS}>
          1つ以上選ぶか、下の補足に記入してください。
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROCEDURE_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.key}
              type="checkbox"
              name="procedures"
              checked={form.procedures.includes(option.key)}
              onChange={() => toggleProcedure(option.key)}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <TextField
        label="処置内容の補足"
        badge="任意"
        multiline
        value={form.procedureNote}
        onChange={(procedureNote) => onChange({ procedureNote })}
      />

      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          麻酔
          <Badge>任意</Badge>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ANESTHESIA_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.key}
              type="radio"
              name="anesthesia"
              checked={form.anesthesia === option.key}
              onChange={() => onChange(anesthesiaPatch(option.key))}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      {form.anesthesia === "used" && (
        <TextField
          label="麻酔の詳細"
          badge="任意"
          hint="名称・使用量などを記入してください。"
          value={form.anesthesiaDetail}
          onChange={(anesthesiaDetail) => onChange({ anesthesiaDetail })}
        />
      )}

      <TextField
        label="使用材料"
        badge="任意"
        value={form.material}
        onChange={(material) => onChange({ material })}
      />

      <TextField
        label="色調"
        badge="任意"
        value={form.shade}
        onChange={(shade) => onChange({ shade })}
      />
    </Section>
  );
}
