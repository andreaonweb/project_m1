# Product CRUD (Reactive Forms + Firestore) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded product list in `/menu` with a Firestore-backed catalog, and add a `/admin` page where a logged-in user can create, edit, and delete products through an Angular Reactive Form.

**Architecture:** A new `ProductService` wraps `@angular/fire/firestore` (already provisioned in `app.config.ts`) and exposes the `products` collection as a `Signal<Product[]>` plus `create`/`update`/`remove`/`seedIfEmpty` methods. `menu.ts` reads from this service instead of a local array. A new `AdminComponent`, guarded by the existing `authGuard`, hosts a single reusable `FormGroup` for create/edit and a table with edit/delete actions per row.

**Tech Stack:** Angular 21 (standalone components, Signals), Angular Reactive Forms, `@angular/fire/firestore`, Vitest (via `@angular/build:unit-test`).

## Global Constraints

- No new backend server — Firestore is the only persistence layer (spec: `docs/superpowers/specs/2026-07-13-product-crud-design.md`).
- `Product` model (`core/models/product.model.ts`) is unchanged — no image upload, no new fields.
- Access control is the existing `authGuard` only — no separate "admin" role.
- Run tests with `--include` pointing at the specific spec file(s) for a task; running bare `ng test` also works once Task 1 is done, but individual `--include` runs are faster during TDD.
- Full test command: `npx ng test --watch=false --include "<glob>"` (project root: `C:\Users\Mati\Desktop\Ejercicios\sakura_project`).

---

## File Structure

| File | Change |
|---|---|
| `src/app/pages/about/about.spec.ts` | Modify — fix wrong import (`About` → `AboutComponent`) |
| `src/app/pages/auth/auth.spec.ts` | Modify — fix wrong import (`Auth` → `AuthComponent`) |
| `src/app/pages/home/home.spec.ts` | Modify — fix wrong import (`Home` → `HomeComponent`) |
| `src/app/pages/menu/menu.spec.ts` | Modify — fix wrong import (Task 1), then add `FakeProductService` provider (Task 3) |
| `src/app/shared/components/footer/footer.spec.ts` | Modify — fix wrong import (`Footer` → `FooterComponent`) |
| `src/app/shared/components/navbar/navbar.spec.ts` | Modify — fix wrong import (`Navbar` → `NavbarComponent`) |
| `src/app/shared/components/product-card/product-card.spec.ts` | Modify — fix wrong import (`ProductCard` → `ProductCardComponent`) |
| `src/app/core/services/product.service.ts` | Create — Firestore-backed CRUD service |
| `src/app/core/services/product.service.spec.ts` | Create — unit tests with mocked Firestore SDK |
| `src/app/pages/menu/menu.ts` | Modify — read products from `ProductService` |
| `src/app/pages/menu/menu.html` | Modify — `products` → `products()` |
| `src/app/pages/admin/admin.ts` | Create — reactive form + CRUD actions |
| `src/app/pages/admin/admin.html` | Create — form + product table template |
| `src/app/pages/admin/admin.scss` | Create — styles following existing mixins/variables |
| `src/app/pages/admin/admin.spec.ts` | Create — component tests with a fake `ProductService` |
| `src/app/app.routes.ts` | Modify — add guarded `/admin` route |
| `src/app/shared/components/navbar/navbar.ts` | Modify — import `Settings` icon |
| `src/app/shared/components/navbar/navbar.html` | Modify — add "Admin" link when logged in |

---

### Task 1: Fix pre-existing broken component test imports

**Context:** Every existing `*.spec.ts` imports the component under the Angular-CLI-generated short name (e.g. `import { Menu } from './menu'`), but the actual exported class is `MenuComponent`. `tsconfig.spec.json` compiles all specs as one TypeScript program, so this one-line mistake in each file currently makes **the entire test suite fail to build** — including any new spec this plan adds. This task only fixes the import name; it does NOT fix the separate, unrelated pre-existing failures in `auth`, `navbar`, `app`, `home`, and `product-card` specs (missing `Auth`/`ActivatedRoute` providers, missing required `product` input) — those are out of scope for this plan.

**Files:**
- Modify: `src/app/pages/about/about.spec.ts`
- Modify: `src/app/pages/auth/auth.spec.ts`
- Modify: `src/app/pages/home/home.spec.ts`
- Modify: `src/app/pages/menu/menu.spec.ts`
- Modify: `src/app/shared/components/footer/footer.spec.ts`
- Modify: `src/app/shared/components/navbar/navbar.spec.ts`
- Modify: `src/app/shared/components/product-card/product-card.spec.ts`

- [ ] **Step 1: Fix `about.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about';

describe('About', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 2: Fix `auth.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth';

describe('Auth', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 3: Fix `home.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home';

describe('Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 4: Fix `menu.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent } from './menu';

describe('Menu', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 5: Fix `footer.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer';

describe('Footer', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 6: Fix `navbar.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar';

describe('Navbar', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 7: Fix `product-card.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardComponent } from './product-card';

describe('ProductCard', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 8: Run the full suite and confirm the TS build error is gone**

Run: `npx ng test --watch=false`
Expected: build succeeds (no `TS2305` errors). Result is **3 passed** (`about`, `footer`, `menu`) and **5 failed** (`auth`, `navbar`, `app`, `home`, `product-card`) — all five failures are `NG0201: No provider found for Auth/ActivatedRoute` or `NG0950: required input 'product'`, none are `TS2305`. This is the expected, unrelated pre-existing state per this task's scope — do not attempt to fix them here.

- [ ] **Step 9: Commit**

```bash
git add src/app/pages/about/about.spec.ts src/app/pages/auth/auth.spec.ts src/app/pages/home/home.spec.ts src/app/pages/menu/menu.spec.ts src/app/shared/components/footer/footer.spec.ts src/app/shared/components/navbar/navbar.spec.ts src/app/shared/components/product-card/product-card.spec.ts
git commit -m "test: fix wrong component import name in existing spec files

Every spec imported the Angular-CLI short name (e.g. Menu) instead of
the actual exported class (MenuComponent), which broke the whole spec
TypeScript program and blocked any test from running."
```

---

### Task 2: `ProductService` (Firestore-backed CRUD)

**Files:**
- Create: `src/app/core/services/product.service.ts`
- Create: `src/app/core/services/product.service.spec.ts`

**Interfaces:**
- Consumes: `Product` from `src/app/core/models/product.model.ts` (`{ id, name, nameJp, price, description, emoji, category, isNew? }`).
- Produces: `ProductService` with `products: Signal<Product[]>`, `create(product: Omit<Product,'id'>): Promise<void>`, `update(id: string, changes: Omit<Product,'id'>): Promise<void>`, `remove(id: string): Promise<void>`, `seedIfEmpty(products: Omit<Product,'id'>[]): Promise<void>` — used by Task 3 (menu) and Task 4 (admin).

- [ ] **Step 1: Write the failing test**

Create `src/app/core/services/product.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { ProductService } from './product.service';
import type { Product } from '../models/product.model';

const mockCollection = vi.fn().mockReturnValue('products-collection');
const mockDoc = vi.fn().mockReturnValue('product-doc-ref');
const mockAddDoc = vi.fn().mockResolvedValue({ id: 'new-id' });
const mockUpdateDoc = vi.fn().mockResolvedValue(undefined);
const mockDeleteDoc = vi.fn().mockResolvedValue(undefined);
const mockCollectionData = vi.fn().mockReturnValue(of([]));

vi.mock('@angular/fire/firestore', () => ({
  Firestore: class {},
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  collectionData: (...args: unknown[]) => mockCollectionData(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
}));

const SAMPLE_PRODUCT: Omit<Product, 'id'> = {
  name: 'Mochi de Fresa',
  nameJp: 'いちご大福',
  price: 3.5,
  description: 'Tierno mochi relleno de anko y fresas frescas.',
  emoji: '🍓',
  category: 'mochi',
};

function createService(initialProducts: Product[] = []): ProductService {
  mockCollectionData.mockReturnValue(of(initialProducts));
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [ProductService, { provide: Firestore, useValue: {} }],
  });
  return TestBed.inject(ProductService);
}

describe('ProductService', () => {
  beforeEach(() => {
    mockCollection.mockClear();
    mockDoc.mockClear();
    mockAddDoc.mockClear();
    mockUpdateDoc.mockClear();
    mockDeleteDoc.mockClear();
  });

  it('should create', () => {
    expect(createService()).toBeTruthy();
  });

  it('exposes an empty products signal when the collection is empty', () => {
    const service = createService();
    expect(service.products()).toEqual([]);
  });

  it('create() adds a document to the products collection', async () => {
    const service = createService();
    await service.create(SAMPLE_PRODUCT);
    expect(mockAddDoc).toHaveBeenCalledWith('products-collection', SAMPLE_PRODUCT);
  });

  it('update() writes changes to the product document', async () => {
    const service = createService();
    const changes = { ...SAMPLE_PRODUCT, name: 'Mochi Actualizado' };
    await service.update('abc123', changes);
    expect(mockDoc).toHaveBeenCalledWith('products-collection', 'abc123');
    expect(mockUpdateDoc).toHaveBeenCalledWith('product-doc-ref', changes);
  });

  it('remove() deletes the product document', async () => {
    const service = createService();
    await service.remove('abc123');
    expect(mockDoc).toHaveBeenCalledWith('products-collection', 'abc123');
    expect(mockDeleteDoc).toHaveBeenCalledWith('product-doc-ref');
  });

  it('seedIfEmpty() adds every sample product when the collection is empty', async () => {
    const service = createService([]);
    await service.seedIfEmpty([SAMPLE_PRODUCT]);
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockAddDoc).toHaveBeenCalledWith('products-collection', SAMPLE_PRODUCT);
  });

  it('seedIfEmpty() does nothing when products already exist', async () => {
    const service = createService([{ id: '1', ...SAMPLE_PRODUCT }]);
    await service.seedIfEmpty([SAMPLE_PRODUCT]);
    expect(mockAddDoc).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include "src/app/core/services/product.service.spec.ts"`
Expected: FAIL — `Cannot find module './product.service'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/app/core/services/product.service.ts`:

```ts
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import type { Observable } from 'rxjs';
import { Product } from '../models/product.model';

const COLLECTION = 'products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private firestore = inject(Firestore);
  private productsRef = collection(this.firestore, COLLECTION);

  products = toSignal(
    collectionData(this.productsRef, { idField: 'id' }) as Observable<Product[]>,
    { initialValue: [] as Product[] }
  );

  async create(product: Omit<Product, 'id'>): Promise<void> {
    await addDoc(this.productsRef, product);
  }

  async update(id: string, changes: Omit<Product, 'id'>): Promise<void> {
    await updateDoc(doc(this.productsRef, id), changes);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.productsRef, id));
  }

  async seedIfEmpty(products: Omit<Product, 'id'>[]): Promise<void> {
    if (this.products().length > 0) return;
    for (const product of products) {
      await addDoc(this.productsRef, product);
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include "src/app/core/services/product.service.spec.ts"`
Expected: PASS — 7 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/product.service.ts src/app/core/services/product.service.spec.ts
git commit -m "feat: add Firestore-backed ProductService"
```

---

### Task 3: Migrate `/menu` to read products from `ProductService`

**Files:**
- Modify: `src/app/pages/menu/menu.ts`
- Modify: `src/app/pages/menu/menu.html`
- Modify: `src/app/pages/menu/menu.spec.ts`

**Interfaces:**
- Consumes: `ProductService.products: Signal<Product[]>` (Task 2).
- Produces: `MenuComponent.products: Signal<Product[]>` (replaces the old plain array field of the same name) — no other component reads `MenuComponent.products`, so no further consumers.

- [ ] **Step 1: Update the (already-fixed) `menu.spec.ts` to fake `ProductService`**

`MenuComponent` will inject `ProductService`, which injects the `Firestore` DI token — not available in the test module. Replace `src/app/pages/menu/menu.spec.ts` with:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MenuComponent } from './menu';
import { ProductService } from '../../core/services/product.service';
import type { Product } from '../../core/models/product.model';

class FakeProductService {
  products = signal<Product[]>([]);
}

describe('Menu', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [{ provide: ProductService, useClass: FakeProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reads products from ProductService', () => {
    expect(component.products()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include "src/app/pages/menu/menu.spec.ts"`
Expected: FAIL — `Property 'products' does not exist` or similar, since `menu.ts` hasn't changed yet (it still has a plain array, not a signal-returning method).

- [ ] **Step 3: Update `menu.ts`**

Replace `src/app/pages/menu/menu.ts` with:

```ts
import { Component, inject } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ProductCardComponent, CurrencyPipe],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent {
  cart = inject(CartService);
  productService = inject(ProductService);

  cartItems = this.cart.getItems();
  products = this.productService.products;

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  removeFromCart(product: Product): void {
    this.cart.remove(product.id);
  }
}
```

- [ ] **Step 4: Update `menu.html`**

In `src/app/pages/menu/menu.html`, change the `@for` loop to call `products()` as a signal:

```html
  <div class="menu__grid">
    @for (product of products(); track product.id) {
    <app-product-card [product]="product" [cartItems]="cartItems()" (onAdd)="addToCart($event)"
      (onRemove)="removeFromCart($event)" />
    }
  </div>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx ng test --watch=false --include "src/app/pages/menu/menu.spec.ts"`
Expected: PASS — 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/menu/menu.ts src/app/pages/menu/menu.html src/app/pages/menu/menu.spec.ts
git commit -m "refactor: read /menu products from ProductService instead of a hardcoded array"
```

---

### Task 4: `AdminComponent` — reactive form + product list (create/edit/delete/seed)

**Files:**
- Create: `src/app/pages/admin/admin.ts`
- Create: `src/app/pages/admin/admin.html`
- Create: `src/app/pages/admin/admin.scss`
- Create: `src/app/pages/admin/admin.spec.ts`

**Interfaces:**
- Consumes: `ProductService` (Task 2) — `products`, `create`, `update`, `remove`, `seedIfEmpty`. `Product` model.
- Produces: `AdminComponent` with public `form: FormGroup`, `editingId: Signal<string | null>`, `error: Signal<string>`, `saving: Signal<boolean>`, methods `startEdit(product: Product): void`, `cancelEdit(): void`, `submit(): Promise<void>`, `remove(product: Product): Promise<void>`, `seed(): Promise<void>` — consumed by Task 5's route wiring (no other task reads its internals).

- [ ] **Step 1: Write the failing test**

Create `src/app/pages/admin/admin.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AdminComponent } from './admin';
import { ProductService } from '../../core/services/product.service';
import type { Product } from '../../core/models/product.model';

class FakeProductService {
  products = signal<Product[]>([]);
  create = vi.fn().mockResolvedValue(undefined);
  update = vi.fn().mockResolvedValue(undefined);
  remove = vi.fn().mockResolvedValue(undefined);
  seedIfEmpty = vi.fn().mockResolvedValue(undefined);
}

const SAMPLE_PRODUCT: Product = {
  id: '1',
  name: 'Mochi de Fresa',
  nameJp: 'いちご大福',
  price: 3.5,
  description: 'Tierno mochi relleno de anko y fresas frescas.',
  emoji: '🍓',
  category: 'mochi',
};

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let productService: FakeProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [{ provide: ProductService, useClass: FakeProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as unknown as FakeProductService;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when required fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('form is valid once required fields are filled', () => {
    component.form.setValue({
      name: 'Mochi de Fresa',
      nameJp: '',
      price: 3.5,
      description: 'Tierno mochi.',
      emoji: '🍓',
      category: 'mochi',
      isNew: false,
    });
    expect(component.form.valid).toBe(true);
  });

  it('submit() calls productService.create with the form value when not editing', async () => {
    component.form.setValue({
      name: 'Mochi de Fresa',
      nameJp: 'いちご大福',
      price: 3.5,
      description: 'Tierno mochi relleno de anko y fresas frescas.',
      emoji: '🍓',
      category: 'mochi',
      isNew: false,
    });

    await component.submit();

    expect(productService.create).toHaveBeenCalledWith({
      name: 'Mochi de Fresa',
      nameJp: 'いちご大福',
      price: 3.5,
      description: 'Tierno mochi relleno de anko y fresas frescas.',
      emoji: '🍓',
      category: 'mochi',
      isNew: false,
    });
    expect(component.editingId()).toBeNull();
  });

  it('startEdit() patches the form and submit() calls productService.update', async () => {
    component.startEdit(SAMPLE_PRODUCT);

    expect(component.editingId()).toBe('1');
    expect(component.form.value.name).toBe('Mochi de Fresa');

    await component.submit();

    expect(productService.update).toHaveBeenCalledWith('1', {
      name: 'Mochi de Fresa',
      nameJp: 'いちご大福',
      price: 3.5,
      description: 'Tierno mochi relleno de anko y fresas frescas.',
      emoji: '🍓',
      category: 'mochi',
      isNew: false,
    });
    expect(component.editingId()).toBeNull();
  });

  it('remove() asks for confirmation and calls productService.remove when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await component.remove(SAMPLE_PRODUCT);

    expect(window.confirm).toHaveBeenCalledWith('¿Borrar "Mochi de Fresa"?');
    expect(productService.remove).toHaveBeenCalledWith('1');
  });

  it('remove() does nothing when the user cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await component.remove(SAMPLE_PRODUCT);

    expect(productService.remove).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include "src/app/pages/admin/admin.spec.ts"`
Expected: FAIL — `Cannot find module './admin'` (files don't exist yet).

- [ ] **Step 3: Write `admin.ts`**

Create `src/app/pages/admin/admin.ts`:

```ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Mochi de Fresa', nameJp: 'いちご大福', price: 3.5, description: 'Tierno mochi relleno de anko y fresas frescas.', emoji: '🍓', category: 'mochi', isNew: true },
  { name: 'Donut Sakura', nameJp: 'さくらドーナツ', price: 4.2, description: 'Glaseado rosa con pétalos de rosa comestibles.', emoji: '🌸', category: 'donut' },
  { name: 'Tarta Matcha', nameJp: '抹茶ケーキ', price: 5.8, description: 'Bizcocho de matcha con nata ligera y judías rojas.', emoji: '🍵', category: 'cake', isNew: true },
  { name: 'Mochi Matcha', nameJp: '抹茶餅', price: 3.5, description: 'Clásico mochi con relleno de pasta de matcha.', emoji: '🟢', category: 'mochi' },
  { name: 'Té de Yuzu', nameJp: 'ゆず茶', price: 3.0, description: 'Refrescante té caliente con cítrico yuzu japonés.', emoji: '🍋', category: 'drink' },
  { name: 'Shortcake Sakura', nameJp: '桜ショートケーキ', price: 6.5, description: 'Tarta japonesa de nata con sakura salada.', emoji: '🎂', category: 'cake' },
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
  private fb = inject(FormBuilder);
  productService = inject(ProductService);

  editingId = signal<string | null>(null);
  error = signal('');
  saving = signal(false);

  readonly categories: Product['category'][] = ['mochi', 'donut', 'cake', 'drink'];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    nameJp: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
    emoji: ['', Validators.required],
    category: this.fb.nonNullable.control<Product['category']>('mochi', Validators.required),
    isNew: [false],
  });

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.patchValue(product);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', nameJp: '', price: 0, description: '', emoji: '', category: 'mochi', isNew: false });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    try {
      const id = this.editingId();
      if (id) {
        await this.productService.update(id, value);
      } else {
        await this.productService.create(value);
      }
      this.cancelEdit();
    } catch (e: any) {
      this.error.set('❌ ' + (e.message ?? 'Error al guardar el producto'));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(product: Product): Promise<void> {
    if (!confirm(`¿Borrar "${product.name}"?`)) return;
    this.error.set('');
    try {
      await this.productService.remove(product.id);
      if (this.editingId() === product.id) this.cancelEdit();
    } catch (e: any) {
      this.error.set('❌ ' + (e.message ?? 'Error al borrar el producto'));
    }
  }

  async seed(): Promise<void> {
    this.error.set('');
    try {
      await this.productService.seedIfEmpty(SAMPLE_PRODUCTS);
    } catch (e: any) {
      this.error.set('❌ ' + (e.message ?? 'Error al cargar productos de ejemplo'));
    }
  }
}
```

- [ ] **Step 4: Write `admin.html`**

Create `src/app/pages/admin/admin.html`:

```html
<section class="admin">
  <div class="admin__header">
    <h1>Gestión de productos</h1>
    <p>Alta, edición y borrado del catálogo</p>
  </div>

  @if (error()) {
  <p class="admin__error">{{ error() }}</p>
  }

  @if (productService.products().length === 0) {
  <div class="admin__seed">
    <p>No hay productos todavía.</p>
    <button type="button" class="btn-primary" (click)="seed()">Cargar productos de ejemplo</button>
  </div>
  }

  <form class="admin__form" [formGroup]="form" (ngSubmit)="submit()">
    <div class="admin__field">
      <label for="name">Nombre</label>
      <input id="name" type="text" formControlName="name" />
    </div>

    <div class="admin__field">
      <label for="nameJp">Nombre en japonés</label>
      <input id="nameJp" type="text" formControlName="nameJp" />
    </div>

    <div class="admin__field">
      <label for="price">Precio (€)</label>
      <input id="price" type="number" step="0.1" formControlName="price" />
    </div>

    <div class="admin__field">
      <label for="emoji">Emoji</label>
      <input id="emoji" type="text" formControlName="emoji" />
    </div>

    <div class="admin__field">
      <label for="category">Categoría</label>
      <select id="category" formControlName="category">
        @for (cat of categories; track cat) {
        <option [value]="cat">{{ cat }}</option>
        }
      </select>
    </div>

    <div class="admin__field admin__field--checkbox">
      <label>
        <input type="checkbox" formControlName="isNew" />
        Marcar como nuevo
      </label>
    </div>

    <div class="admin__field admin__field--full">
      <label for="description">Descripción</label>
      <textarea id="description" formControlName="description"></textarea>
    </div>

    <div class="admin__actions">
      <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
        {{ editingId() ? 'Guardar cambios' : 'Añadir producto' }}
      </button>
      @if (editingId()) {
      <button type="button" class="admin__cancel" (click)="cancelEdit()">Cancelar</button>
      }
    </div>
  </form>

  <table class="admin__table">
    <thead>
      <tr>
        <th>Producto</th>
        <th>Categoría</th>
        <th>Precio</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      @for (product of productService.products(); track product.id) {
      <tr>
        <td>{{ product.emoji }} {{ product.name }}</td>
        <td>{{ product.category }}</td>
        <td>{{ product.price | currency:'EUR' }}</td>
        <td class="admin__row-actions">
          <button type="button" (click)="startEdit(product)">✏️</button>
          <button type="button" (click)="remove(product)">🗑️</button>
        </td>
      </tr>
      }
    </tbody>
  </table>
</section>
```

- [ ] **Step 5: Write `admin.scss`**

Create `src/app/pages/admin/admin.scss`:

```scss
@use '../../../styles/variables' as *;
@use '../../../styles/mixins' as *;

.admin {
  max-width: 720px;
  margin: 3rem auto;
  padding: 0 1.5rem;

  &__header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }

    p {
      color: $text-muted;
      margin: 0;
    }
  }

  &__error {
    background: #fdeceb;
    color: #c0392b;
    padding: 0.75rem 1rem;
    border-radius: $radius-sm;
    margin-bottom: 1rem;
  }

  &__seed {
    @include card;
    text-align: center;
    padding: 1.5rem;
    margin-bottom: 2rem;

    p {
      color: $text-muted;
      margin-bottom: 1rem;
    }
  }

  &__form {
    @include card;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: $text-dark;
    }

    input,
    select,
    textarea {
      border: 1px solid $border;
      border-radius: $radius-sm;
      padding: 0.5rem 0.75rem;
      font-family: $font-main;
      font-size: 0.9rem;
    }

    &--full {
      grid-column: 1 / -1;
    }

    &--checkbox {
      flex-direction: row;
      align-items: center;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  &__actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 0.75rem;
  }

  &__cancel {
    background: transparent;
    border: 1px solid $border;
    border-radius: $radius-xl;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      text-align: left;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid $border;
    }
  }

  &__row-actions {
    display: flex;
    gap: 0.5rem;

    button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
  }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx ng test --watch=false --include "src/app/pages/admin/admin.spec.ts"`
Expected: PASS — 7 tests passed.

- [ ] **Step 7: Commit**

```bash
git add src/app/pages/admin/
git commit -m "feat: add admin product CRUD page with reactive form"
```

---

### Task 5: Wire the `/admin` route, navbar link, and manually verify

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/shared/components/navbar/navbar.ts`
- Modify: `src/app/shared/components/navbar/navbar.html`

**Interfaces:**
- Consumes: `AdminComponent` (Task 4), existing `authGuard` (`src/app/core/guards/auth.guard.ts`), existing `AuthService.isLoggedIn` signal.

- [ ] **Step 1: Add the route**

In `src/app/app.routes.ts`, add the `admin` route next to `menu` (same guard pattern):

```ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu').then(m => m.MenuComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.AdminComponent),
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent),
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent),
  },
  { path: '**', redirectTo: 'home' },
];
```

- [ ] **Step 2: Add the `Settings` icon to the navbar component**

In `src/app/shared/components/navbar/navbar.ts`, import `Settings` and expose it:

```ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { LucideAngularModule, House, UtensilsCrossed, Heart, ShoppingBag, Settings } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CurrencyPipe, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);

  cartOpen = signal(false);
  cartItems = this.cart.getItems();

  readonly House = House;
  readonly UtensilsCrossed = UtensilsCrossed;
  readonly Heart = Heart;
  readonly ShoppingBag = ShoppingBag;
  readonly Settings = Settings;

  toggleCart(): void {
    this.cartOpen.update(v => !v);
  }
}
```

- [ ] **Step 3: Add the "Admin" link to the navbar template**

In `src/app/shared/components/navbar/navbar.html`, add a new `<li>` inside `<ul class="navbar__links">`, after the "Nosotras" link, gated by `auth.isLoggedIn()`:

```html
  <ul class="navbar__links">
    <li><a [routerLink]="'home'" routerLinkActive="active">
        <lucide-icon [name]="House" [size]="16" aria-hidden="true"></lucide-icon> Inicio
      </a></li>
    <li><a [routerLink]="'menu'" routerLinkActive="active">
        <lucide-icon [name]="UtensilsCrossed" [size]="16" aria-hidden="true"></lucide-icon> Menú
      </a></li>
    <li><a [routerLink]="'about'" routerLinkActive="active">
        <lucide-icon [name]="Heart" [size]="16" aria-hidden="true"></lucide-icon> Nosotras
      </a></li>
    @if (auth.isLoggedIn()) {
    <li><a [routerLink]="'admin'" routerLinkActive="active">
        <lucide-icon [name]="Settings" [size]="16" aria-hidden="true"></lucide-icon> Admin
      </a></li>
    }
  </ul>
```

- [ ] **Step 4: Run the full new-code test slice**

Run: `npx ng test --watch=false --include "src/app/core/services/product.service.spec.ts" --include "src/app/pages/menu/menu.spec.ts" --include "src/app/pages/admin/admin.spec.ts"`
Expected: PASS — all tests from Tasks 2–4 pass together.

- [ ] **Step 5: Manually verify in the browser**

Follow this project's `run` skill (or `npm start` if none is found) to launch the dev server, then:
1. Go to `http://localhost:4200/auth`, log in (or register a test user).
2. Navigate to `/admin` via the new navbar link — confirm it's reachable only when logged in.
3. Click "Cargar productos de ejemplo" — confirm the 6 sample products appear in the table below.
4. Fill the form and submit — confirm a new product appears in the table.
5. Click ✏️ on a row — confirm the form populates, submit — confirm the row updates in place.
6. Click 🗑️ on a row, confirm the browser `confirm()` dialog, accept — confirm the row disappears.
7. Navigate to `/menu` — confirm the product list matches what's currently in Firestore (reflects create/edit/delete from step 3-6).

- [ ] **Step 6: Commit**

```bash
git add src/app/app.routes.ts src/app/shared/components/navbar/navbar.ts src/app/shared/components/navbar/navbar.html
git commit -m "feat: wire /admin route and navbar link"
```

---

## Self-Review Notes

- **Spec coverage:** Firestore persistence (Task 2), `/menu` reading from the same source (Task 3), `/admin` page with reactive form + create/edit/delete (Task 4), route + navbar gating (Task 5), manual seed button (Task 4/5) — all spec requirements are covered. The pre-existing broken-test blocker (discovered during planning, not in the original spec) is handled minimally in Task 1, scoped exactly as approved.
- **Type consistency:** `Omit<Product, 'id'>` is the consistent shape for `create`/`update`/`seedIfEmpty` payloads across `ProductService` (Task 2) and `AdminComponent.form.getRawValue()` (Task 4) — verified field-by-field (`name`, `nameJp`, `price`, `description`, `emoji`, `category`, `isNew`) match `Product` minus `id`.
- **No placeholders:** every step has complete, runnable code; no TBD/TODO remain.
