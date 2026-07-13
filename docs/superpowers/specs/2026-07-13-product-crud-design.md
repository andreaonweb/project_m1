# Product CRUD (Reactive Forms + Firestore) — Design

## Context

The app currently hardcodes 6 products as a plain array in `menu.ts`. The
project already provisions Firestore in `app.config.ts` (via
`provideFirestore(() => getFirestore())`) but nothing uses it yet. We're
adding a basic CRUD (create, edit, delete) for products, backed by
Firestore, driven by an Angular Reactive Form.

## Goals

- Admin can create, edit, and delete products through a form.
- The public `/menu` page reflects those changes (single source of truth).
- No new backend server — Firestore is the persistence layer (already
  configured, used only by Auth today).

## Non-goals

- Image upload / Firebase Storage — products keep using an `emoji` field,
  no new field is added.
- Role-based admin permissions — access control is the existing
  `authGuard` (any logged-in user), no separate "admin" role concept.
- Automated data migration script requiring Firebase Admin SDK credentials.

## Data model

`Product` (`core/models/product.model.ts`) is unchanged:

```ts
export interface Product {
  id: string;
  name: string;
  nameJp: string;
  price: number;
  description: string;
  emoji: string;
  category: 'mochi' | 'donut' | 'cake' | 'drink';
  isNew?: boolean;
}
```

Firestore collection: `products`. Document ID = `Product.id` (Firestore
auto-id on create, since the previous hardcoded numeric ids are meaningless
once persisted).

## Architecture

### `ProductService` (new — `core/services/product.service.ts`)

Wraps `@angular/fire/firestore`:

- `products: Signal<Product[]>` — built with
  `collectionData(collection(firestore, 'products'), { idField: 'id' })`
  piped through `toSignal(..., { initialValue: [] })`.
- `create(product: Omit<Product, 'id'>): Promise<void>` → `addDoc`.
- `update(id: string, changes: Omit<Product, 'id'>): Promise<void>` →
  `updateDoc(doc(firestore, 'products', id), changes)`.
- `remove(id: string): Promise<void>` → `deleteDoc`.
- `seedIfEmpty(products: Product[]): Promise<void>` — only used by the
  admin page's one-time seed button; writes each product via `addDoc`
  (omitting the old numeric `id`, letting Firestore assign new ids).

### `menu.ts` changes

- Remove the hardcoded `products: Product[]` array.
- Inject `ProductService`, expose `products = this.productService.products`.
- Template (`menu.html`) unchanged — it already iterates `products` and
  reads from the same shape.

### `/admin` page (new — `pages/admin/admin.ts|html|scss`)

- Route added to `app.routes.ts`, guarded by the existing `authGuard`
  (same guard already used for `/menu`).
- Navbar gets an "Admin" link, shown only when `auth.isLoggedIn()` (same
  condition block that already shows the cart button / logout).

**Form:** single `FormGroup` (Angular Reactive Forms), reused for both
create and edit:

| Field | Control type | Validators |
|---|---|---|
| `name` | text | `required` |
| `nameJp` | text | — |
| `price` | number | `required`, `min(0.01)` |
| `description` | textarea | `required` |
| `emoji` | text | `required` |
| `category` | select (`mochi`/`donut`/`cake`/`drink`) | `required` |
| `isNew` | checkbox | — |

**Flow:**

- **Create:** form starts empty (`editingId` signal is `null`). Submit
  (valid) → `productService.create(form.value)`, then `form.reset()`.
- **Edit:** an ✏️ button per row calls `startEdit(product)`, which does
  `form.patchValue(product)` and sets `editingId.set(product.id)`. The
  submit button label switches to "Guardar cambios"; submit now calls
  `productService.update(editingId(), form.value)` and clears `editingId`
  + resets the form.
- **Delete:** a 🗑️ button per row calls `remove(product)`, gated by a
  native `confirm(...)` dialog, then `productService.remove(product.id)`.
- Below the form: a simple table/list of current products from
  `productService.products()` with the edit/delete actions per row.

**Seeding:** if `productService.products().length === 0` (checked after
the initial Firestore emission), show a "Cargar productos de ejemplo"
button. Clicking it calls
`productService.seedIfEmpty(SAMPLE_PRODUCTS)`, where `SAMPLE_PRODUCTS` is
the current 6-item array moved out of `menu.ts` into a constant in
`admin.ts` (or a small shared file) purely for this one-time seed. This
avoids needing Firebase Admin SDK / service-account credentials — it's a
plain authenticated client write, same permission level as any other CRUD
op in this design.

## Error handling

- Firestore write failures (create/update/remove/seed) are caught and
  surfaced as a simple inline error message signal on the admin page
  (no toast library in the project currently).
- Form submit is a no-op while the form is invalid (submit button
  `disabled` bound to `form.invalid`).

## Testing

- Manual verification via the `run` flow: log in, go to `/admin`, seed
  sample products, create a new product, edit it, delete it, and confirm
  `/menu` reflects each change.
- No existing test suite covers `menu.ts` or services beyond scaffold
  specs; this design doesn't add automated tests (matches current project
  convention — Vitest is configured but no meaningful specs exist yet for
  services/pages).

## Open items resolved during brainstorming

- Persistence: Firestore (not in-memory signals).
- UI location: dedicated `/admin` page (not inline in `/menu`).
- Image handling: keep `emoji` field, no image URL/upload.
- Initial data: migrate the 6 existing hardcoded products into Firestore
  via a manual one-time seed button (no automated migration script).
