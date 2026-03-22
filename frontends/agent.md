# Agent Guide

This file defines how AI agents should work in the Rocket frontend monorepo.
The current project target is a React Native + Expo app, managed as a monorepo with `sdk-ts`, `sdk-ui`, and `rocket-fe`.

## 1. Core Stack
- React Native 0.79 + Expo 53
- React 19
- TypeScript
- Zustand
- TanStack Query / react-query-kit
- Expo Router
- NativeWind
- Monorepo packages:
  - `@rocket/sdk-ts`
  - `@rocket/sdk-ui`
  - `rocket-fe`

## 2. Architecture Boundary

### `sdk-ts`
Purpose: business logic layer.

Put these here:
- Custom hooks for business logic
- Zustand stores and state transitions
- Query / mutation hooks
- API client wrappers
- Request/response types
- Domain mapping, validation, transformation, normalization
- Reusable logic with no screen-specific UI

Do not put these here:
- Screen layout
- Expo Router route files
- App-specific page composition
- Visual-only component code

Rule:
- If the code decides data, state, side effects, fetch lifecycle, form workflow, or user action behavior, it belongs in `sdk-ts`.

### `sdk-ui`
Purpose: reusable UI layer built on top of hooks and logic from `sdk-ts`.

Put these here:
- Shared presentational components
- Feature components that consume hooks from `sdk-ts`
- Common UI primitives and composition blocks
- Shared loading, error, empty, list, form, modal, bottom sheet, and button patterns
- Theme-aware and reusable app UI

Do not put these here:
- Route definitions
- Screen ownership logic tied to a single app flow
- App bootstrap code
- Business rules that should live in hooks/stores

Rule:
- `sdk-ui` receives hooks and state from `sdk-ts`, then turns them into reusable components.
- Prefer reusing existing shared parts already in `sdk-ui/src/components/common` instead of rebuilding them.

### `rocket-fe`
Purpose: application shell and screen orchestration.

Put these here:
- Expo Router route files in `src/app`
- Screen composition
- Navigation flow
- App providers and bootstrap wiring
- App-specific integration code
- Minimal screen-level glue code for connecting route params to `sdk-ui`

Do not put these here:
- Reusable business logic
- Shared hooks that belong to `sdk-ts`
- Shared UI components that belong to `sdk-ui`

Rule:
- `rocket-fe` should mostly define screens, routes, providers, and app wiring, then consume components from `sdk-ui`.

## 3. Package Flow
- Preferred dependency direction:
  - `sdk-ts` -> no dependency on app screens
  - `sdk-ui` -> can depend on `sdk-ts`
  - `rocket-fe` -> can depend on both `sdk-ts` and `sdk-ui`
- Avoid reverse dependencies.
- Do not import from `rocket-fe` into `sdk-ui` or `sdk-ts`.

## 4. File Placement Rules
- New business hook: place in `sdk-ts`
- Zustand store or store helper: place in `sdk-ts`
- API integration and query/mutation definitions: place in `sdk-ts`
- Shared feature component: place in `sdk-ui`
- Shared form widget / modal / list / section / button: place in `sdk-ui`
- Route file, screen file, tab/stack layout: place in `rocket-fe/src/app`
- App bootstrap providers: place in `rocket-fe`

When unsure:
- If it can be reused by multiple screens and contains UI, prefer `sdk-ui`.
- If it can be reused by multiple screens and contains behavior or data logic, prefer `sdk-ts`.
- If it only wires a route or a screen together, prefer `rocket-fe`.

## 5. State and Data Guidelines
- Use Zustand for app and domain state.
- Use TanStack Query / react-query-kit for server state.
- Keep fetch logic, mutation logic, optimistic updates, and derived business state in `sdk-ts`.
- Components in `sdk-ui` should consume stable hook interfaces instead of reimplementing data logic.
- `rocket-fe` should avoid owning business state unless it is strictly route-local and not reusable.

## 6. UI Guidelines
- Reuse shared components from `sdk-ui` before creating new ones.
- Reuse common building blocks under `sdk-ui/src/components/common` where possible.
- Keep components composable and app-agnostic when they live in `sdk-ui`.
- Put visual variants in UI components, not in route files.
- Keep screens in `rocket-fe` thin: compose sections, pass params, and handle navigation.
- Prefer `Row`/`Stack` from `sdk-ui/src/components/common/Layout.tsx` for layout instead of raw `View` wrappers, and feed styling via their props rather than external `StyleSheet` objects.
- Use `fontStyles` from `sdk-ui` when defining text styles, applying them directly instead of recreating typography helpers in route files or new components.

## 7. Expo Router Guidelines
- Route files belong in `rocket-fe/src/app`.
- Keep route files focused on:
  - reading route params
  - navigation
  - screen composition
  - calling app bootstrap or provider glue
- Avoid embedding reusable feature logic directly in route files.

## 8. Refactoring Preference
Some existing code may still live in `rocket-fe` while the monorepo architecture is being stabilized.

For new code and refactors:
- move business logic toward `sdk-ts`
- move reusable UI toward `sdk-ui`
- keep `rocket-fe` as the app shell and screen layer

Do not expand old app-local patterns if they conflict with this target architecture.

## 9. Practical Decision Checklist
Before adding code, ask:
1. Is this business logic or state? Put it in `sdk-ts`.
2. Is this reusable UI that consumes hooks? Put it in `sdk-ui`.
3. Is this only screen/route composition? Put it in `rocket-fe`.
4. Am I duplicating an existing shared part from `sdk-ui`? Reuse it first.
5. Am I placing reusable logic in `rocket-fe`? Move it down a layer.

## 10. Reference Paths
- `sdk-ts/`: business logic, hooks, stores, queries, API
- `sdk-ui/src/components`: reusable UI components
- `sdk-ui/src/components/common`: shared primitives and common building blocks
- `rocket-fe/src/app`: Expo Router screens and route layouts
- `rocket-fe/src/api`: current app wiring and API provider setup
- `rocket-fe/src/lib`: current app bootstrap and local app utilities
