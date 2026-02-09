## Goals
- Compile a living Context Guide covering architecture, tech stack, endpoints, data model, auth, error handling, dev setup, and frontend–backend mapping.
- Resolve env/database alignment (Postgres in `.env` vs Prisma provider `sqlite`).
- Add quickstart scripts and docs to accelerate onboarding and verification.

## Deliverables
- `docs/context.md`: high-level architecture, key directories, run/build scripts, and service topology.
- `docs/api-inventory.md`: backend route inventory with methods, paths, middleware, and handler file references.
- `docs/data-model.md`: Prisma model summary with relations and constraints.
- `docs/dev-setup.md`: environment, Docker Compose usage, `.env` setup, run workflows, and common troubleshooting.
- `docs/frontend-overview.md`: routes, protection wrappers, service usage, and UI feature map (Playground/Visualization).

## Implementation Steps
1. Create `docs/` directory and author the five markdown guides using the discovered repository facts and verified file paths.
2. Cross-link guides for easy navigation; include code references like `apps/backend/src/app.ts:89` where helpful.
3. Document auth flow (JWT + refresh sessions) and error handling patterns; include request/response examples.
4. Clarify DB choice:
   - Document current `sqlite` provider in `apps/backend/prisma/schema.prisma` and the Postgres target in `apps/backend/.env.example`.
   - Propose a safe migration note describing how to switch Prisma provider to Postgres if desired.
5. Add a concise root `README` section pointing to the new docs and updating quickstart (run backend + frontend concurrently).

## Verification
- Manually re-verify all referenced paths and line ranges while writing docs.
- Run a local dev environment checklist in the doc (not executing yet) to ensure instructions are correct.

## Next
- After approval, I will add the `docs` files and update the root `README` accordingly, then offer to run the dev servers and validate the API/UX quickly.