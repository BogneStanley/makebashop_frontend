import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [ButtonModule, RouterModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  @Input() title = 'Collection Été';
  @Input() subtitle = 'Découvrez nos pièces exclusives, alliant artisanat et sophistication moderne.';
  @Input() ctaText = 'Découvrir la collection';
  @Input() ctaLink = '/products';
}
