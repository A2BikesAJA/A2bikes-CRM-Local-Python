# CONTENT_TODO — values A2 must confirm before this guide ships

Every item below renders as a visible placeholder in the app today. Nothing
here is a guessed value. Replace each in `src/content/steps.json` (or `theme.ts`
where noted) and delete the line.

## Torque values — REQUIRED before customer release

| Where | Field | Current placeholder | Needed |
|------|-------|---------------------|--------|
| Step 3 — Install seatpost & saddle | Frame seatpost binder / wedge | `nm: null` → renders "See printed value on frame binder — A2 to confirm" | The actual binder/wedge spec, or confirm "use value printed on the binder" is the intended customer instruction |

All other torque values in the guide are A2-confirmed or come from the SP
owner's manual Appendix D and are already populated:
cockpit clamps 5–6 N·m · saddle clamp 5–6 N·m · top cap 2–3 N·m ·
pedals 34.5–40 N·m. (Reference-only specs not surfaced as steps: rotor-to-hub
4–7, caliper mount 6–9, RD mount 8–10, RD cable pinch 4–5, RD pulley 3–4.)

> The front thru-axle intentionally shows **no number** — it instructs the
> customer to use the spec printed on the axle/hub. The manual's legacy
> 30–42 N·m QR axle-nut figure is deliberately **not shown anywhere**.

## Support contact — REQUIRED (the two `<<CONFIRM>>` values)

| Where | Field | Needed |
|------|-------|--------|
| `steps.json → meta.support.email` | Support email | A2 customer-support email address |
| `steps.json → meta.support.url` | Contact URL | A2 support / contact page URL |

## Brand colors — RECOMMENDED

| Where | Field | Current | Needed |
|------|-------|---------|--------|
| `src/three/theme.ts → COLORWAYS.oswego.frame` | Oswego Blue hex | `#1e4d78` (approx) | Exact A2 PMS / hex |
| `src/three/theme.ts → COLORWAYS.summit.frame` | Summit Grey hex | `#5b6168` (approx) | Exact A2 PMS / hex |

## Optional / later

- `videoTimestamp` on each step is reserved for deep-linking the official A2
  assembly video. Populate with second offsets when the video exists.
- Per-build drivetrain tuning copy (Step 7) is written to general best practice;
  have a mechanic confirm it matches A2's preferred customer guidance.
