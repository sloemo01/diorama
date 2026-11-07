# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Universal Inspection Controls

Copy `templates/orbit.js` for EVERY scene and preset. Create it after camera fit with the fitted target; keep animation evaluation independent of camera interaction. Render on control change even when paused. Expose `orbit.reset()` and have the QA freeze wrapper reset it before capture (`freeze(t)` evaluates time synchronously). User pause/freeze UI need not reset their chosen inspection angle. Fit zoom/polar limits to real subject bounds without preventing back/high inspection. No auto-rotation, no camera motion driven by the animation clock. Keep reset + a brief drag/keyboard hint accessible; educational controls and selection follow `Canonical educational UI and inspection contract`.

