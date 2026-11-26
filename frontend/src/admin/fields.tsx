import { useId, useState } from "react";
import type { ReactNode } from "react";
import { uploadMedia } from "../auth";

// Small form building blocks used all over the admin page.
// Each one takes the current `value` and an `onChange` function: the parent
// owns the data, the field only displays it and reports edits. This pattern
// is called a "controlled input" in React.

const inputClass =
  "w-full border border-text/15 bg-bg px-3 py-2 text-text outline-none transition-colors focus:border-accent";

function Label({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="font-mono text-xs text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted/80">{hint}</p>}
    </div>
  );
}

export function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Label id={id} label={props.label} hint={props.hint}>
      <input
        id={id}
        className={inputClass}
        value={props.value ?? ""}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </Label>
  );
}

export function TextArea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Label id={id} label={props.label} hint={props.hint}>
      <textarea
        id={id}
        rows={props.rows ?? 4}
        className={`${inputClass} resize-y`}
        value={props.value ?? ""}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </Label>
  );
}

export function NumberField(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <Label id={id} label={props.label} hint={props.hint}>
      <input
        id={id}
        type="number"
        min={props.min}
        max={props.max}
        step={props.step}
        className={inputClass}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </Label>
  );
}

// A list of strings edited as text: one item per line.
// Kept as raw text while typing, so blank lines don't vanish mid-edit.
export function LinesField(props: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  const [text, setText] = useState(props.value.join("\n"));
  return (
    <Label id={id} label={props.label} hint={props.hint ?? "One per line."}>
      <textarea
        id={id}
        rows={props.rows ?? Math.max(3, Math.min(props.value.length + 1, 10))}
        className={`${inputClass} resize-y`}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          props.onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
        }}
      />
    </Label>
  );
}

export function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 accent-[var(--accent)]"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
        />
        {props.label}
      </label>
      {props.hint && <p className="pl-7 text-xs text-muted/80">{props.hint}</p>}
    </div>
  );
}

export function ColorField(props: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  return (
    <Label id={id} label={props.label} hint={props.hint}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${props.label} picker`}
          className="h-10 w-14 cursor-pointer border border-text/15 bg-bg p-1"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
        <input
          id={id}
          className={`${inputClass} font-mono`}
          value={props.value}
          maxLength={7}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
    </Label>
  );
}

export function SelectField(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <Label id={id} label={props.label} hint={props.hint}>
      <select id={id} className={inputClass} value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Label>
  );
}

// A URL field with an "Upload" button that sends a file to Cloudinary and
// fills in the URL it gets back.
export function MediaField(props: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  accept?: string;
  hint?: string;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      props.onChange(await uploadMedia(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Label id={id} label={props.label} hint={props.hint ?? "Paste a link, or upload an image or .mp4/.webm video."}>
      <div className="flex flex-wrap gap-3">
        <input
          id={id}
          className={`${inputClass} min-w-0 flex-1`}
          value={props.value ?? ""}
          onChange={(e) => props.onChange(e.target.value || null)}
        />
        <label className="cursor-pointer border border-text/25 px-4 py-2 text-sm hover:border-accent">
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            className="sr-only"
            accept={props.accept ?? "image/*,video/mp4,video/webm"}
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
    </Label>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "plain",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "plain" | "primary" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    plain: "border-text/20 text-text hover:border-text/50",
    primary: "border-accent bg-accent text-bg hover:brightness-110",
    danger: "border-accent/50 text-accent hover:border-accent",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer border px-4 py-2 text-sm transition disabled:cursor-default disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}
