import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SETTINGS_NAV_ITEMS } from './settings-nav';

@Component({
  selector: 'app-settings-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './settings-layout.html',
  styleUrl: './settings-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsLayout {
  readonly navItems = SETTINGS_NAV_ITEMS;
}
