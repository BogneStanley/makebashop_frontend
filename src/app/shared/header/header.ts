import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, BadgeModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  cartItemsCount = signal(3);
}
