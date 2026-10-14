import Badge from "./Badge";
import ChoiceChip from "./ChoiceChip";
import Section from "./Section";
import { GUIDE_BOX } from "./ui";
import {
  JAW_LABELS,
  SIDE_LABELS,
  SURFACE_KEYS,
  TOOTH_NUMBERS,
  getSurfaceLabels,
} from "@/lib/cr/options";
import type { FormState, Jaw, Side, SurfaceKey } from "@/lib/cr/types";

type Props = {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
};

const JAWS: readonly Jaw[] = ["upper", "lower"];
const SIDES: readonly Side[] = ["right", "left"];

export default function ToothSection({ form, onChange }: Props) {
  // 歯面の名称は上顎・下顎と番号で決まるので、両方が決まるまで選択させない
  const surfaceLabels =
    form.jaw !== null && form.toothNumber !== null
      ? getSurfaceLabels(form.jaw, form.toothNumber)
      : null;

  const toggleSurface = (key: SurfaceKey) => {
    onChange({
      surfaces: form.surfaces.includes(key)
        ? form.surfaces.filter((surface) => surface !== key)
        : [...form.surfaces, key],
    });
  };

  return (
    <Section id="tooth" step={1} title="処置部位">
      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          上顎・下顎
          <Badge>必須</Badge>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {JAWS.map((jaw) => (
            <ChoiceChip
              key={jaw}
              type="radio"
              name="jaw"
              checked={form.jaw === jaw}
              onChange={() => onChange({ jaw })}
            >
              {JAW_LABELS[jaw]}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          右・左
          <Badge>必須</Badge>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIDES.map((side) => (
            <ChoiceChip
              key={side}
              type="radio"
              name="side"
              checked={form.side === side}
              onChange={() => onChange({ side })}
            >
              {SIDE_LABELS[side]}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          歯の番号(1〜8)
          <Badge>必須</Badge>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOOTH_NUMBERS.map((toothNumber) => (
            <ChoiceChip
              key={toothNumber}
              type="radio"
              name="toothNumber"
              checked={form.toothNumber === toothNumber}
              onChange={() => onChange({ toothNumber })}
            >
              {toothNumber}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4 min-w-0">
        <legend className="text-base font-bold">
          歯面(複数選択できます)
          <Badge>任意</Badge>
        </legend>
        {surfaceLabels === null ? (
          <p className={`mt-2 ${GUIDE_BOX}`}>
            先に歯の位置(上顎・下顎と番号)を選んでください。
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {SURFACE_KEYS.map((key) => (
              <ChoiceChip
                key={key}
                type="checkbox"
                name="surfaces"
                checked={form.surfaces.includes(key)}
                onChange={() => toggleSurface(key)}
              >
                {surfaceLabels[key]}
              </ChoiceChip>
            ))}
          </div>
        )}
      </fieldset>
    </Section>
  );
}
