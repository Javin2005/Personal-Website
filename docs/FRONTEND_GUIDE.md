# How the frontend works

A walkthrough of the React code in `frontend/src`, written for someone who knows programming but is new to frontend work. Every example is taken from this project, so you can open the file and see it in context.

## What changed in the redesign

The visual side:

- New look built around the black hole. The video starts bright behind the hero and dims as you scroll, instead of sitting at the same brightness behind everything.
- Fonts are Unbounded for headings, IBM Plex Sans for text and IBM Plex Mono for small labels. Colors come from the renderer: near-black, warm white, an orange accent ("redshift") and a rare blue one ("blueshift").
- Sections no longer have "01. / 02." numbers. Each section has its title in a narrow left column and its content on the right. The projects section deliberately breaks that layout to give the black hole renderer a large slot.
- The video is 1.2 MB instead of 4.7 MB, and the profile photo is 74 KB instead of 3.8 MB.
- The login page is still terminal-style, but without the blinking icon and "ACCESS DENIED" messages.

The structure:

- Removed: the Life gallery, the Creative section, the status bar across the top of every page (it's now a line in the footer) and the old logo.
- Added: Experience, Education, Skills and Interests sections, a Tools page, and an admin page that can edit all of it.
- Nothing on the public pages is hard-coded any more. Every text, color, font, section and menu link comes from the database through one request to `/api/site`.
- The last content a visitor saw is stored in their browser, so on the next visit the page shows immediately, even while the free Render server is waking up.

## The order things happen in

When someone opens the site:

1. The browser loads `index.html`, which has one empty `<div id="root">` and a script tag for `src/main.tsx`.
2. `main.tsx` tells React to draw `<App />` inside that div.
3. `App.tsx` wraps everything in `<SiteProvider>`, which starts loading `/api/site`, and a router that picks a page from the URL.
4. For `/` the page is `Home`. It draws the hero and then one component per visible section, in the order from the settings.
5. When the data arrives, React redraws everything that uses it.

## Components and JSX

A component is a function that returns what should be on the screen. The HTML-looking syntax is called JSX. It's not a string; it compiles to ordinary function calls.

```tsx
// components/sections/Section.tsx (simplified)
export default function Section({ id, title, children }: Props) {
  return (
    <section id={id} className="border-t border-text/10 py-20">
      <h2 className="font-display text-3xl">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
```

Things to notice:

- Curly braces `{ }` switch from JSX back to JavaScript: `{title}` inserts the value of `title`.
- `className` instead of `class`, because `class` is a reserved word in JavaScript.
- A component's name starts with a capital letter. That's how React tells `<Section>` (your component) from `<section>` (the HTML tag).
- `children` is whatever you put between the opening and closing tag when you use the component: `<Section title="About"><p>hi</p></Section>`.

### Showing something only sometimes

```tsx
{hero.status && <p>{hero.status}</p>}
```

`a && b` means "if `a` is truthy, use `b`". An empty string is falsy, so an empty status line draws nothing. For an either/or, use the ternary `condition ? this : that`:

```tsx
{status === "sending" ? "Sending…" : "Send message"}
```

### Lists

```tsx
// ExperienceSection.tsx
{site.experience.map((job) => (
  <li key={job.id}>{job.role}</li>
))}
```

`.map` turns each item of the array into a piece of JSX. `key` must be unique among siblings; React uses it to know which row is which when the list changes.

### Fragments

`<> ... </>` groups elements without adding an extra tag to the page. It's used in the hero to put a `<br />` and the second name line together.

## Props: passing data into a component

The values you pass to a component are its props. In TypeScript you write down their types:

```tsx
export default function ExperienceSection({ section }: { section: SectionSettings }) {
```

The part before the colon unpacks the `section` prop. The part after says its type. The `SectionSettings` type is defined in `types.ts`.

## State: data that changes

`useState` gives a component a value that survives between redraws, plus a function to change it. Calling that function makes React draw the component again with the new value.

```tsx
// ContactSection.tsx
const [form, setForm] = useState({ name: "", email: "", message: "" });

<input
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
/>
```

This is a controlled input. The input always shows `form.name`, and every keystroke updates `form`.

`{ ...form, name: e.target.value }` makes a new object with everything from `form` and a new `name`. In React you never change state in place (`form.name = "x"` would not redraw anything). You always create a new value and hand it to the setter.

Functions that start with `use` (`useState`, `useEffect`, `useSite`) are called hooks. They have one rule: call them at the top of a component, never inside an `if` or a loop.

## Effects: doing things outside of drawing

Drawing should only compute what to show. Anything else, like fetching data, timers and event listeners, goes in `useEffect`:

```tsx
// Nav.tsx
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll); // cleanup
}, []);
```

- The function runs after the component is on screen.
- The array at the end lists the values the effect depends on. `[]` means "run once". `[site.settings.theme]` (in `SiteContext.tsx`) means "run again whenever the theme changes".
- The function you return is the cleanup. React runs it when the component disappears, so you don't leave listeners behind.

## Context: data the whole site needs

Almost every component needs the site data. Instead of passing it down through every level, `SiteProvider` puts it in a context and any component can read it:

```tsx
const { site } = useSite();
const featured = site.projects.filter((p) => p.featured);
```

`site/SiteContext.tsx` does the loading (cache first, then the server), and `site/useSite.ts` holds the hook that reads it.

## Routing: pages without reloading

`App.tsx` maps URLs to components:

```tsx
<Route path="/projects" element={<Projects />} />
<Route path="/tools/:slug" element={<ToolPage />} />
```

`:slug` is a placeholder. In `ToolPage`, `useParams()` gives you the actual value from the URL.

There are three kinds of links, and `Nav.tsx` picks between them:

- `<Link to="/projects">` for pages in this site. It switches pages without reloading.
- `<HashLink smooth to="/#contact">` for a section on the homepage. It scrolls there smoothly.
- `<a href="https://..." target="_blank">` for other websites.

## Talking to the backend

```tsx
const res = await fetch(`${API_URL}/api/site`);
const data: SiteData = await res.json();
```

`fetch` sends an HTTP request and gives back a promise. `await` waits for it without freezing the page; it can only be used inside an `async` function. The backticks make a template string, where `${...}` inserts a value.

For admin requests, use the helpers in `auth.ts`:

- `authFetch(path, options)` adds the login token and sends you to `/login` if the backend says the token is invalid.
- `sendJson(path, "PUT", body)` sends JSON and throws an error with the backend's message if something is wrong. The editors catch that error and show it.
- `uploadMedia(file)` uploads to Cloudinary through the backend and returns the URL.

## Styling with Tailwind

Every class in `className` is one small CSS rule. Reading a class list from left to right tells you what an element looks like:

```tsx
<h3 className="text-xl leading-snug transition-colors group-hover:text-accent">
```

| Class | Meaning |
| --- | --- |
| `text-xl` | font size |
| `leading-snug` | line height |
| `transition-colors` | animate color changes |
| `group-hover:text-accent` | use the accent color when the parent with class `group` is hovered |

Prefixes apply a class only in some situations:

- `md:grid-cols-2`: from medium screen width (768px) and up. Without a prefix, a class applies on phones too, so the layout is written for phones first and widened with `md:` and `lg:`.
- `hover:`, `focus:`, `disabled:`: only in that state.
- Square brackets are a one-off value: `text-[clamp(44px,7vw,96px)]`, `tracking-[-0.03em]`.

### Where the theme colors come from

`text-accent`, `bg-bg`, `border-text/15` and `font-display` are not built-in Tailwind colors. They are defined in `index.css`:

```css
@theme inline {
  --color-accent: var(--accent);
  --font-display: var(--font-display-family);
}
```

`--accent` is a CSS variable. `site/theme.ts` sets it from the saved settings when the site loads, so changing the accent in the admin page changes every `text-accent` on the site. The `/15` in `border-text/15` means the text color at 15% opacity.

## TypeScript bits you'll see

- `interface Project { title: string; github_url: string | null }`: describes the shape of an object. `|` means "or".
- `site.about?.name`: `?.` stops and gives `undefined` if `about` is null, instead of crashing.
- `about?.name ?? "Christian J. Carlson"`: `??` uses the right side when the left is `null` or `undefined`.
- `CollectionEditor<T extends Ordered>`: a generic. `T` stands for whichever item type the editor is used with (Project, Experience...). TypeScript then checks that the field names you list actually exist on that type.
- `import type { ... }`: imports only types. They disappear when the code is built.

## Labels: the small text

Buttons, form fields and messages also come from the settings, through a small hook in `site/labels.ts`:

```tsx
const t = useLabels();
<button>{t("formSend")}</button>                          // "Send message"
<span>{t("skipTo", { next: "experience" })}</span>          // "Skip to experience"
```

`t` looks up the label in the saved settings, falls back to the default, and fills in anything in curly brackets. To add a new label, add it to `DEFAULT_LABELS` and `LABEL_GROUPS` in `labels.ts` (and to `DEFAULT_LABELS` in `backend/app/default_content.py`), then use `t("yourKey")`. It shows up in Admin → Labels automatically.

## The admin page

`pages/Admin.tsx` has two kinds of tabs.

The settings tabs (Appearance, Hero, Sections & menu, Labels) all edit one `draft` object. Nothing is sent until you press **Save changes**. While you edit colors and fonts, `applyTheme(draft.theme)` previews them on the admin page itself.

The content tabs use `admin/CollectionEditor.tsx`. It is one component that can edit any list. You tell it the API path and which fields to show:

```tsx
<CollectionEditor<Experience>
  path="experience"
  fields={[
    { key: "role", label: "Role", type: "text" },
    { key: "tags", label: "Tags", type: "list" },
  ]}
  ...
/>
```

The API keys tab (`admin/ApiKeysEditor.tsx`) creates keys for programs like the Claude MCP server. The full key is shown once, right after it's created; the backend only keeps a hash of it.

On the backend, `content.py` does the same trick: `collection_router` creates the six endpoints (list, list all, add, reorder, save, delete) for every table.

## Things to try

1. In the admin page, change the accent color and watch the preview, then press Discard.
2. Add a book under Interests, then turn the Interests section on under Sections & menu. Note the "Skip to" button the section gets.
3. Add a new setting: a field in `Settings` in `types.ts`, the same in `SettingsData` in `backend/app/schemas.py` and `DEFAULT_SETTINGS` in `default_content.py`, an input in `admin/SettingsEditors.tsx`, and use it somewhere with `useSite()`.
4. Make your first tool: create `src/tools/hello/index.tsx` with `export default function Hello() { return <p>Hello</p>; }` and add it to `tools/registry.ts`.
