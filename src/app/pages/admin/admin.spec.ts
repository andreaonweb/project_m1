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
      price: 3.5,
      description: 'Tierno mochi relleno de anko y fresas frescas.',
      emoji: '🍓',
      category: 'mochi',
      isNew: false,
    });

    await component.submit();

    expect(productService.create).toHaveBeenCalledWith({
      name: 'Mochi de Fresa',
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

  it('startEdit() does not carry a stale isNew value over from a previous edit', () => {
    component.startEdit({ ...SAMPLE_PRODUCT, isNew: true });
    expect(component.form.value.isNew).toBe(true);

    const productWithoutIsNew: Product = {
      id: '2',
      name: 'Donut Sakura',
      price: 4.2,
      description: 'Glaseado rosa con pétalos de rosa comestibles.',
      emoji: '🌸',
      category: 'donut',
    };
    component.startEdit(productWithoutIsNew);

    expect(component.form.value.isNew).toBe(false);
  });

  it('seed() sets saving() while in flight and resets it to false afterwards', async () => {
    let resolveSeed!: () => void;
    productService.seedIfEmpty.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSeed = resolve;
      }),
    );

    const seedPromise = component.seed();
    expect(component.saving()).toBe(true);

    resolveSeed();
    await seedPromise;

    expect(component.saving()).toBe(false);
  });
});
