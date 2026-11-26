import { useCallback, useEffect, useState } from "react";
import { authFetch, errorText, sendJson } from "../auth";
import { useSite } from "../site/useSite";
import type { Ordered } from "../types";
import { Button, LinesField, MediaField, NumberField, TextArea, TextField, Toggle } from "./fields";

// Describes one input in the edit form. `key` is the name of the field on
// the item, e.g. "role" for an Experience.
export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type: "text" | "textarea" | "lines" | "list" | "checkbox" | "number" | "media";
  hint?: string;
  min?: number;
  max?: number;
}

interface Props<T extends Ordered> {
  path: string; // API path, e.g. "experience" -> /api/experience
  title: string;
  description: string;
  fields: FieldDef<T>[];
  blank: Omit<T, keyof Ordered>; // the values a new item starts with
  label: (item: T) => string; // the text shown in the list for an item
}

// One generic editor for every list on the site (projects, experience,
// education, skills, interests). `<T extends Ordered>` is a TypeScript
// "generic": T stands for whichever item type the editor is used with.
export default function CollectionEditor<T extends Ordered>(props: Props<T>) {
  const { path, fields, blank, label } = props;
  const { reload } = useSite();
  const [items, setItems] = useState<T[]>([]);
  const [openId, setOpenId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<T>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await authFetch(`/api/admin/${path}`);
    if (res.ok) setItems(await res.json());
    else setMessage(await errorText(res));
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  // After any change: refresh this list and the public site data.
  const done = async (text: string) => {
    setMessage(text);
    await load();
    reload();
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      await done(success);
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
      return false;
    }
  };

  const open = (item: T | "new") => {
    setMessage("");
    if (item === "new") {
      setOpenId("new");
      setDraft({ ...blank } as Partial<T>);
    } else {
      setOpenId(item.id);
      setDraft({ ...item });
    }
  };

  const save = async () => {
    const ok =
      openId === "new"
        ? await run(() => sendJson(`/api/${path}`, "POST", draft), "Added.")
        : await run(() => sendJson(`/api/${path}/${openId}`, "PUT", draft), "Saved.");
    if (ok) setOpenId(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const ids = items.map((i) => i.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]]; // swap the two
    run(() => sendJson(`/api/${path}/order`, "PUT", ids), "Order saved.");
  };

  const toggleVisible = (item: T) =>
    run(
      () => sendJson(`/api/${path}/${item.id}`, "PUT", { ...item, visible: !item.visible }),
      item.visible ? "Hidden from the site." : "Shown on the site.",
    );

  const remove = (item: T) => {
    // First click asks, second click deletes.
    if (confirmDelete !== item.id) {
      setConfirmDelete(item.id);
      return;
    }
    setConfirmDelete(null);
    run(() => sendJson(`/api/${path}/${item.id}`, "DELETE"), "Deleted.");
  };

  const form = (
    <div className="grid gap-5 border border-text/15 bg-bg/60 p-5">
      {fields.map((f) => (
        <FieldInput key={f.key} def={f} draft={draft} setDraft={setDraft} />
      ))}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={save}>
          {openId === "new" ? "Add" : "Save"}
        </Button>
        <Button onClick={() => setOpenId(null)}>Cancel</Button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="font-display text-2xl font-light">{props.title}</h2>
          <p className="max-w-[60ch] text-sm text-muted">{props.description}</p>
        </div>
        <Button onClick={() => open("new")}>Add new</Button>
      </header>

      {message && <p className="font-mono text-xs text-accent2">{message}</p>}
      {openId === "new" && form}

      <ol className="grid">
        {items.map((item, index) => (
          <li key={item.id} className="border-t border-text/10 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-6 font-mono text-xs text-muted">{index + 1}</span>
              <span className={`min-w-0 flex-1 ${item.visible ? "" : "text-muted line-through"}`}>{label(item)}</span>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => move(index, -1)} disabled={index === 0}>
                  ↑
                </Button>
                <Button onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                  ↓
                </Button>
                <Button onClick={() => toggleVisible(item)}>{item.visible ? "Hide" : "Show"}</Button>
                <Button onClick={() => (openId === item.id ? setOpenId(null) : open(item))}>
                  {openId === item.id ? "Close" : "Edit"}
                </Button>
                <Button variant="danger" onClick={() => remove(item)}>
                  {confirmDelete === item.id ? "Really delete?" : "Delete"}
                </Button>
              </div>
            </div>
            {openId === item.id && <div className="mt-4">{form}</div>}
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="text-sm text-muted">Nothing here yet. Use "Add new" to create the first one.</p>}
    </div>
  );
}

// Picks the right input for a field definition.
function FieldInput<T>({
  def,
  draft,
  setDraft,
}: {
  def: FieldDef<T>;
  draft: Partial<T>;
  setDraft: (d: Partial<T>) => void;
}) {
  const value = draft[def.key] as unknown;
  const set = (v: unknown) => setDraft({ ...draft, [def.key]: v });

  switch (def.type) {
    case "textarea":
      return <TextArea label={def.label} hint={def.hint} value={(value as string) ?? ""} onChange={set} rows={5} />;
    case "lines":
      return <LinesField label={def.label} hint={def.hint} value={(value as string[]) ?? []} onChange={set} />;
    case "list":
      return (
        <TextField
          label={def.label}
          hint={def.hint ?? "Separate with commas."}
          value={((value as string[]) ?? []).join(", ")}
          onChange={(v) => set(v.split(",").map((s) => s.trim()))}
        />
      );
    case "checkbox":
      return <Toggle label={def.label} hint={def.hint} checked={Boolean(value)} onChange={set} />;
    case "number":
      return (
        <NumberField
          label={def.label}
          hint={def.hint}
          min={def.min}
          max={def.max}
          value={(value as number) ?? 0}
          onChange={set}
        />
      );
    case "media":
      return <MediaField label={def.label} hint={def.hint} value={(value as string | null) ?? null} onChange={set} />;
    default:
      return <TextField label={def.label} hint={def.hint} value={(value as string) ?? ""} onChange={set} />;
  }
}
