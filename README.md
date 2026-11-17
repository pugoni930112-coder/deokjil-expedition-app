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

The app uses Supabase for email/password sign-up and sign-in, email-link sign-in, password recovery, private expedition records and photos, fan-market posts, and publicly readable fan-recommended places. Sign-up requires an email, an 8-character minimum password, and a phone number; an X handle is optional. Phone numbers and X handles are stored as private account metadata and are not used for SMS verification. Only signed-in users can add or edit a fan-recommended place.

The restaurant map uses the VWorld 2D JavaScript map API. Get an API key from the [VWorld developer center](https://www.vworld.kr/dev/v4dv_opn2dmap2guide_s001.do), allow the development host and `pugoni930112-coder.github.io` in its domain settings, then set `VITE_VWORLD_API_KEY` in `.env.local` for local development. For GitHub Pages, add the same key as the `VWORLD_API_KEY` repository Actions secret; the key is compiled into the browser app, so restrict its allowed domains in VWorld.

### Local development

Copy `.env.example` to `.env.local` and set the project URL and publishable key from the Supabase project API settings. `.env.local` is ignored by Git.

### Authentication redirect URLs

In Supabase Dashboard, open **Authentication → URL Configuration**. Set the **Site URL** to `https://pugoni930112-coder.github.io/deokjil-expedition-app/` and add these exact URLs under **Redirect URLs**:

- `http://localhost:5173/deokjil-expedition-app/`
- `http://localhost:5173/deokjil-expedition-app/password-reset`
- `https://pugoni930112-coder.github.io/deokjil-expedition-app/`
- `https://pugoni930112-coder.github.io/deokjil-expedition-app/password-reset`

Email confirmation and password reset links always return to the deployed GitHub Pages app, including when signup starts on a local development server.

### GitHub Pages build

The Pages workflow supplies the Supabase project URL, publishable key, and VWorld API key during the Vite build. These are browser-side client settings; never use a Supabase service-role or secret key in the browser app.
