import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule, Header, Footer, ButtonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
