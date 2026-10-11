import Badge from "./Badge";
import ChoiceChip from "./ChoiceChip";
import TextField from "./TextField";
import { EXPLANATION_OPTIONS } from "@/lib/cr/options";
import type { ExplanationKey, FormState } from "@/lib/cr/types";

type Props = {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
};

export default function ExplanationSection({ form, onChange }: Props) {
  const toggleExplanation = (key: ExplanationKey) => {
    onChange({
      explanations: form.explanations.includes(key)
        ? form.explanations.filter((explanation) => explanation !== key)
        : [...form.explanations, key],
    });
  };

  return (
    <section
      aria-labelledby="explanation-heading"
      className="mt-6 rounded-lg border border-accent bg-surface p-4"
    >
      <h2 id="explanation-heading" className="text-xl font-bold">
        説明・次回予定・補足
      </h2>

      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          患者に説明した項目(複数選択できます)
          <Badge>任意</Badge>
        </legend>
        <p className="mt-1 text-sm">
          下書きには選択した項目名だけが入ります。説明の文章は自動では追加されません。
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXPLANATION_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.key}
              type="checkbox"
              name="explanations"
              checked={form.explanations.includes(option.key)}
              onChange={() => toggleExplanation(option.key)}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <TextField
        label="説明内容の補足"
        badge="任意"
        multiline
        value={form.explanationNote}
        onChange={(explanationNote) => onChange({ explanationNote })}
      />

      <TextField
        label="次回予定"
        badge="任意"
        value={form.nextVisit}
        onChange={(nextVisit) => onChange({ nextVisit })}
      />

      <TextField
        label="その他の所見・補足"
        badge="任意"
        multiline
        value={form.remarks}
        onChange={(remarks) => onChange({ remarks })}
      />
    </section>
  );
}
