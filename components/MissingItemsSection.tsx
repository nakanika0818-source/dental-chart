import { getMissingItems } from "@/lib/cr/missingItems";
import type { MissingItem } from "@/lib/cr/missingItems";
import type { FormState } from "@/lib/cr/types";

type Props = {
  form: FormState;
};

type GroupProps = {
  heading: string;
  description: string;
  emptyText: string;
  items: MissingItem[];
  className: string;
};

// 色だけに頼らず、見出しと説明の文字でグループを区別する
function Group({ heading, description, emptyText, items, className }: GroupProps) {
  return (
    <div className={`mt-4 rounded-lg p-3 ${className}`}>
      <h3 className="text-base font-bold">
        {heading}
        <span className="ml-2 font-normal">{`(${items.length}件)`}</span>
      </h3>
      <p className="mt-1 text-sm">{description}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-base">{emptyText}</p>
      ) : (
        <ul className="mt-2 list-disc pl-6 text-base">
          {items.map((item) => (
            <li key={item.key} className="mt-1 break-words">
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MissingItemsSection({ form }: Props) {
  const { required, needsConfirmation, optional } = getMissingItems(form);

  return (
    <section
      aria-labelledby="missing-heading"
      className="mt-6 rounded-lg border border-accent bg-surface p-4"
    >
      <h2 id="missing-heading" className="text-xl font-bold">
        未入力・未確認の項目
      </h2>

      <Group
        heading="必須項目の未入力"
        description="入力するまで下書きを生成できません。"
        emptyText="必須項目の未入力はありません。"
        items={required}
        className="border-l-4 border-foreground bg-notice"
      />
      <Group
        heading="確認してください"
        description="下書きは生成できますが、内容を確認してください。"
        emptyText="確認を促す項目はありません。"
        items={needsConfirmation}
        className="border-2 border-accent bg-surface"
      />
      <Group
        heading="任意項目の未入力"
        description="空欄のままでも下書きを生成できます。エラーではありません。"
        emptyText="任意項目の未入力はありません。"
        items={optional}
        className="border border-dashed border-foreground/40 bg-background"
      />

      <p className="mt-4 text-sm">
        この一覧は入力欄の空欄を示すもので、記録の医学的な完全性を保証するものではありません。
      </p>
    </section>
  );
}
