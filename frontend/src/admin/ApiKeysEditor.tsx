import { useCallback, useEffect, useState } from "react";
import { authFetch, errorText, sendJson } from "../auth";
import { Button, TextField } from "./fields";
import { Group } from "./SettingsEditors";

interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
}

function when(iso: string | null): string {
  if (!iso) return "never";
  // Old SQLite rows have no timezone; they were saved in UTC.
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return date.toLocaleString();
}

// API keys let programs (like Claude through the MCP server) edit the site.
export default function ApiKeysEditor() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("Claude");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await authFetch("/api/admin/api-keys");
    if (res.ok) setKeys(await res.json());
    else setMessage(await errorText(res));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    try {
      const created = await sendJson<ApiKey & { key: string }>("/api/admin/api-keys", "POST", { name });
      setNewKey(created.key);
      setMessage("");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't create the key");
    }
  };

  const revoke = async (key: ApiKey) => {
    if (confirm !== key.id) {
      setConfirm(key.id);
      return;
    }
    setConfirm(null);
    try {
      await sendJson(`/api/admin/api-keys/${key.id}`, "DELETE");
      setMessage(`Revoked "${key.name}". Anything using it stops working now.`);
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't revoke the key");
    }
  };

  const copy = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setMessage("Copied.");
    } catch {
      setMessage("Couldn't copy automatically; select the key and copy it.");
    }
  };

  return (
    <div className="grid gap-10">
      <header className="grid gap-1">
        <h2 className="font-display text-2xl font-light">API keys</h2>
        <p className="max-w-[62ch] text-sm text-muted">
          A key lets a program edit the site for you without your password, for example Claude through the MCP
          server described in the README. A key can change content and settings, but it can't create or revoke
          keys. Revoke a key as soon as you don't need it.
        </p>
      </header>

      {message && <p className="font-mono text-xs text-accent2">{message}</p>}

      {newKey && (
        <div className="grid gap-3 border border-accent/60 bg-surface p-5">
          <p className="text-sm">
            Your new key. <strong className="font-medium text-accent">It's shown only this once</strong>, so copy it
            now and keep it somewhere safe, like a password manager.
          </p>
          <code className="overflow-x-auto bg-bg p-3 font-mono text-sm break-all select-all">{newKey}</code>
          <div className="flex gap-3">
            <Button variant="primary" onClick={copy}>
              Copy
            </Button>
            <Button onClick={() => setNewKey(null)}>I've saved it</Button>
          </div>
        </div>
      )}

      <Group title="Create a key">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <TextField label="Name" hint="So you know what the key is for." value={name} onChange={setName} />
          <Button variant="primary" onClick={create} disabled={!name.trim()}>
            Create key
          </Button>
        </div>
      </Group>

      <Group title="Your keys">
        {keys.length === 0 ? (
          <p className="text-sm text-muted">No keys yet.</p>
        ) : (
          <ul className="grid">
            {keys.map((key) => (
              <li key={key.id} className="flex flex-wrap items-center gap-4 border-t border-text/10 py-3">
                <div className="min-w-0 flex-1">
                  <p>{key.name}</p>
                  <p className="font-mono text-xs text-muted">
                    {key.prefix}… · created {when(key.created_at)} · last used {when(key.last_used_at)}
                  </p>
                </div>
                <Button variant="danger" onClick={() => revoke(key)}>
                  {confirm === key.id ? "Really revoke?" : "Revoke"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Group>
    </div>
  );
}
