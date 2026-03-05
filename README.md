# Momentum Portal

The Momentum Portal is a starter app for building on the Kinetic Platform. It provides a self-service portal with pre-built UI, Kinetic Forms, Kinetic Workflows, and patterns for implementing new projects.

This project is designed to be modified for specific project requirements. Developers are free to add different libraries, styles, and reorganize the structure as needed. The theming, layout, and patterns here represent one approach — not the only approach. Since this is a self-service portal starter, other types of apps (admin tools, dashboards, etc.) may need significant reorganization based on their requirements.

The main intent of this project is to enable developers and AI tools to understand patterns for interacting with the Kinetic Platform.

## Project Structure

```
momentum-portal/
├── portal/               # React frontend application
├── template/             # Kinetic Platform configurations (forms, workflows, teams)
├── frontend-testing/     # Playwright end-to-end tests
├── ai-skills/            # Shared AI skills submodule (Claude, Cursor, Copilot)
├── install.rb            # Ruby script for provisioning new spaces
└── .github/workflows/    # CI/CD pipelines
```

## Portal

The frontend application built with React 18, Vite, Tailwind CSS 4, and DaisyUI.

### Key Technologies

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Hash-based client-side routing |
| Redux Toolkit | Global state management |
| Tailwind CSS 4 + DaisyUI | Styling (DaisyUI uses `k` prefix: `kbtn`, `kcard`, etc.) |
| Ark UI | Headless interactive components (modals, menus, popovers) |
| @kineticdata/react | Kinetic Platform API helpers, CoreForm, authentication |
| Vite | Build tool and dev server |
| Tabler Icons | Icon library |

### Source Structure

```
portal/src/
├── assets/styles/        # CSS files (theming, layout utilities, component styles)
├── atoms/                # Design system primitives (Button, Modal, Menu, Panel, etc.)
├── components/           # Composite components
│   ├── kinetic-form/     # KineticForm wrapper + custom widgets
│   ├── header/           # App header with navigation
│   ├── footer/           # App footer
│   ├── search/           # Global search modal
│   └── states/           # Loading and error states
├── helpers/              # Utilities, Redux state, and custom hooks
│   ├── hooks/            # useData, usePaginatedData, usePoller, etc.
│   ├── state.js          # Redux slices (app, theme, view)
│   └── theme.js          # Theme configuration and CSS generation
├── pages/                # Route-level page components
│   ├── home/             # Dashboard with activity and shortcuts
│   ├── tickets/          # Requests and actions (submissions)
│   ├── forms/            # Form submission pages
│   ├── profile/          # User profile
│   ├── settings/         # User and datastore settings
│   ├── theme/            # Theme editor (admin only)
│   └── login/            # Login and password reset
├── App.jsx               # Root component with auth flow
├── index.jsx             # Entry point (Redux, KineticLib, Router setup)
└── redux.js              # Store configuration with dynamic slice injection
```

### Routes

**Public**: `/login`, `/reset-password/:token?`

**Private (authenticated)**:
- `/` — Home dashboard
- `/actions/*` — Tasks assigned to the user
- `/requests/*` — Service requests submitted by the user
- `/forms/:formSlug/:submissionId?` — Form submissions
- `/profile` — User profile
- `/settings/*` — Settings and datastore management
- `/theme` — Theme editor (admin only)

### Kinetic Forms Integration

Forms are rendered via the `KineticForm` component which wraps `CoreForm` from `@kineticdata/react`. Custom widgets extend form capabilities:

- **Markdown** — WYSIWYG markdown editor
- **Search** — Typeahead search with static or API data sources
- **Signature** — Canvas-based signature capture
- **Subform** — Nested form rendering (modal or inline)
- **Table** — Data table with filtering, sorting, and pagination

See the [Form Widgets documentation](portal/src/components/kinetic-form/widgets/README.md) for details.

### Theming

Theme configuration is stored as a Kapp attribute and applied as CSS variables at runtime. The admin theme editor (`/theme`) allows real-time customization of colors and border radii. DaisyUI and Tailwind consume these CSS variables for consistent styling.

### Data Fetching

All API calls use the `useData()` hook which wraps Kinetic Platform API helpers with loading and error states. `usePaginatedData()` adds pagination support. The `@kineticdata/react` library provides `fetchSpace()`, `fetchProfile()`, `fetchKapp()`, `searchSubmissions()`, and other helpers.

### Getting Started

See [portal/README.md](portal/README.md) for development setup instructions.

## Template

Contains exported Kinetic Platform configurations that get installed when provisioning new spaces.

```
template/
├── export/
│   ├── core/           # Spaces, kapps, forms, teams, attributes, categories
│   ├── integrator/     # Integration connections
│   └── task/           # Workflows, handlers, routines
└── tooling/
    ├── export.rb       # Export script to pull configurations from a running space
    └── export_driver.rb# CLI wrapper with environment variable configuration
```

### Export

Use the Ruby export scripts to pull the latest configurations from a running Kinetic Platform space. See the [Export Guide](template/tooling/README.md).

### Install

Installation is done via `install.rb` which accepts a JSON configuration string with platform URLs, credentials, and API endpoints. This script is typically run by a workflow process during space provisioning, not manually.

See the [Momentum Portal Tooling](https://kineticdata.atlassian.net/wiki/spaces/KD/pages/1167360002/Momentum+Portal+Tooling) page for detailed installation information.

## Frontend Testing

End-to-end tests using Playwright. Tests cover authentication flows and navigation.

```
frontend-testing/
├── tests/
│   ├── auth.spec.ts          # Authentication flow tests
│   └── sidebarMenu.spec.ts   # Navigation tests
├── playwright.config.ts      # Playwright configuration
└── package.json
```

Configure test credentials via environment variables: `PW_BASE_URI`, `PW_SPACE_URI`, `PW_USERNAME`, `PW_PASSWORD`.

## CI/CD

GitHub Actions workflows handle build, security scanning (Snyk), and deployment to S3:

| Workflow | Trigger | Action |
|---|---|---|
| `portal-pr.yaml` | PR to `portal/` | Build + Snyk scan |
| `portal-main-commits.yaml` | Push to main in `portal/` | Build + deploy to S3 (latest) |
| `portal-tag-push.yaml` | Tag push | Build + deploy to S3 (versioned) |
| `portal-build-dispatch.yaml` | Manual dispatch | Build any branch + deploy to S3 |

## AI Skills

This project includes shared AI skills for the Kinetic Platform via a git submodule at `ai-skills/`. These skills provide context to AI coding tools (Claude Code, Cursor, GitHub Copilot) about Kinetic Platform APIs, workflows, forms, and front-end patterns.

To initialize after cloning:

    git submodule update --init ai-skills

- **Project-specific documentation** should be added locally to this project.
- **Reusable Kinetic Platform patterns** should be added to the `ai-skills/` submodule and submitted as a pull request to [kineticdata/kinetic-platform-ai-skills](https://github.com/kineticdata/kinetic-platform-ai-skills) so all projects benefit.
