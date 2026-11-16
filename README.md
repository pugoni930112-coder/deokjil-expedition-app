# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Supabase setup

The app uses Supabase for email-link sign-in, private expedition records, and private record photos.

### Local development

Copy `.env.example` to `.env.local` and set the project URL and publishable key from the Supabase project API settings. `.env.local` is ignored by Git.

### Email sign-in redirects

In Supabase Dashboard, open **Authentication → URL Configuration** and add these exact URLs under **Redirect URLs**:

- `http://localhost:5173/deokjil-expedition-app/`
- `https://pugoni930112-coder.github.io/deokjil-expedition-app/`

### GitHub Pages build

In the repository's **Settings → Secrets and variables → Actions**, add these repository secrets. The Pages workflow reads them during the Vite build:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never use a Supabase service-role or secret key in the browser app.
