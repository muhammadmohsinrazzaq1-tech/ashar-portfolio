import { Input, Textarea, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "url"
    | "number"
    | "color"
    | "textarea"
    | "select"
    | "checkbox"
    | "multiline";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
  options?: FieldOption[];
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("\n");
  return String(value);
}

function toBool(value: unknown): boolean {
  if (typeof value === "string") {
    return ["true", "on", "1", "yes"].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
}

interface AdminFieldProps {
  field: FieldConfig;
  /** Current value (from the DB row) used as the default. */
  value?: unknown;
}

/** Label + control pair driven by a FieldConfig. Uncontrolled (defaultValue). */
export function AdminField({ field, value }: AdminFieldProps) {
  const id = `field-${field.name}`;

  if (field.type === "checkbox") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-line bg-graphite px-4 py-3">
        <input
          id={id}
          name={field.name}
          type="checkbox"
          defaultChecked={toBool(value)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#c79a2b]"
        />
        <div>
          <Label htmlFor={id} className="mb-0.5 cursor-pointer">
            {field.label}
          </Label>
          {field.hint && <p className="text-xs text-sand/80">{field.hint}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-gold">*</span>}
      </Label>

      {field.type === "textarea" || field.type === "multiline" ? (
        <Textarea
          id={id}
          name={field.name}
          defaultValue={toText(value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={field.rows ?? 4}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          defaultValue={toText(value)}
          required={field.required}
          className={cn(
            "flex h-11 w-full cursor-pointer rounded-md border border-line bg-graphite px-4 text-sm text-cream",
            "transition-colors focus:border-gold-muted focus:outline-none"
          )}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-graphite">
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-3">
          <input
            id={id}
            name={field.name}
            type="color"
            defaultValue={/^#[0-9a-fA-F]{6}$/.test(toText(value)) ? toText(value) : "#c79a2b"}
            className="h-11 w-16 cursor-pointer rounded-md border border-line bg-graphite p-1"
            aria-label={field.label}
          />
          <span className="font-mono text-sm text-sand">{toText(value) || "—"}</span>
        </div>
      ) : (
        <Input
          id={id}
          name={field.name}
          type={field.type}
          defaultValue={toText(value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      )}

      {field.hint && <p className="mt-1 text-xs text-sand/80">{field.hint}</p>}
    </div>
  );
}
