import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CurrencyPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);

  cartOpen = signal(false);
  cartItems = this.cart.getItems();

  toggleCart(): void {
    this.cartOpen.update(v => !v);
  }
}