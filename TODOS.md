# TODOS

## Hidash OS: post-v1

### Global Bug Hunt leaderboard
- **What:** A public top-scores board for Bug Hunt.
- **Why:** Gives return visitors a reason to replay, and makes for more shareable moments.
- **Pros:** Extra social hook, and repeat visits.
- **Cons:** Needs storage, display-name moderation and stronger anti-cheat than the v1 plausibility bound.
- **Context:** v1 ships share-only with HMAC-signed tokens (see docs/designs/hidash-os.md › Share). Start from the token payload `{s,t,m}` and add a store keyed by token id.
- **Depends on / blocked by:** Milestone 1 share data showing that people actually play and share.

### Sound set
- **What:** UI and game sounds (marimba clicks, water drop, chenda drum roll), off until the first tap.
- **Why:** Adds feel and identity.
- **Pros:** Memorable.
- **Cons:** Audio assets add weight, and sound can be unwelcome in LinkedIn's webview.
- **Context:** Ideas came from the "Monsoon Glass" design voice in office hours.
- **Depends on / blocked by:** v1 launch.

### Photos app, Terminal, Trash behavior, marquee select, right-click menus
- **What:** Post-v1 OS extras from the launch cut line.
- **Why:** Fidelity and easter eggs.
- **Pros:** Delight for people who explore.
- **Cons:** More surface to maintain.
- **Context:** Listed as Post-v1 in docs/designs/hidash-os.md › Launch scope.
- **Depends on / blocked by:** v1 launch.

### Live AI Twin ("Ask Hidash")
- **What:** A talking avatar grounded in the portfolio content.
- **Why:** The user's stated end goal for the character.
- **Pros:** The biggest wow factor.
- **Cons:** Per-visit cost, risk of wrong answers, and provider consent and capture requirements.
- **Context:** Designed after v1. It reuses the character identity and needs a talking-to-camera recording plus consent.
- **Depends on / blocked by:** Character art approved; provider evaluation.

### Remaining character states
- **What:** walk, point, type, sleep and panic states beyond the launch set (idle, wave, celebrate).
- **Why:** The full "OS reacts to you" experience.
- **Pros:** Richer behavior.
- **Cons:** Animation production time.
- **Context:** The character lane's proof gate (wave) must pass first.
- **Depends on / blocked by:** Character art pipeline (open question 1).
