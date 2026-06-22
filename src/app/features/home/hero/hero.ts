import { Component, input, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-hero',
  imports: [ButtonModule, RouterModule, InputTextModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  title = input("Redécouvrez l'élégance");
  subtitle = input(
    'Nous offrons une sélection exclusive de vêtements pour femmes, alliant style intemporel et qualité supérieure. Explorez nos produits et trouvez votre prochain coup de cœur mode.',
  );
  ctaText = input('Parcourir les articles');
  ctaLink = input('/products');
}
