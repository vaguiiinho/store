# Web (apps/web)
- Routes in `app/` (pt-BR paths: catalogo, produto, carrinho, checkout, pedido(s), conta, login, admin); server actions in `app/actions`.
- `proxy.ts`: optimistic redirect to `/login` when `store_session` cookie missing; real validation in `lib/session.ts` and the API.
- API access: `src/services/api-client.ts` (base `API_URL` → `NEXT_PUBLIC_API_URL` → `http://localhost:3001/api`) and `src/services/storefront-api.ts`. `lib/storefront-api.ts` is a compatibility facade — new code imports from `src/services/`.
- Components flat in `components/` (kebab-case files; `admin-*` for admin UI). Cart state in `cart-provider.tsx` + `lib/cart.ts`.
- No web tests yet (`test` script is a placeholder).
