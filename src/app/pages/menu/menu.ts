import { Component, inject, computed } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { CartService } from '../../core/services/cart.service';
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
  cartItems = this.cart.getItems();

  products: Product[] = [
    { id: '1', name: 'Mochi de Fresa', nameJp: 'いちご大福', price: 3.5, description: 'Tierno mochi relleno de anko y fresas frescas.', emoji: '🍓', category: 'mochi', isNew: true },
    { id: '2', name: 'Donut Sakura', nameJp: 'さくらドーナツ', price: 4.2, description: 'Glaseado rosa con pétalos de rosa comestibles.', emoji: '🌸', category: 'donut' },
    { id: '3', name: 'Tarta Matcha', nameJp: '抹茶ケーキ', price: 5.8, description: 'Bizcocho de matcha con nata ligera y judías rojas.', emoji: '🍵', category: 'cake', isNew: true },
    { id: '4', name: 'Mochi Matcha', nameJp: '抹茶餅', price: 3.5, description: 'Clásico mochi con relleno de pasta de matcha.', emoji: '🟢', category: 'mochi' },
    { id: '5', name: 'Té de Yuzu', nameJp: 'ゆず茶', price: 3.0, description: 'Refrescante té caliente con cítrico yuzu japonés.', emoji: '🍋', category: 'drink' },
    { id: '6', name: 'Shortcake Sakura', nameJp: '桜ショートケーキ', price: 6.5, description: 'Tarta japonesa de nata con sakura salada.', emoji: '🎂', category: 'cake' },
  ];

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  removeFromCart(product: Product): void {
    this.cart.remove(product.id);
  }
}