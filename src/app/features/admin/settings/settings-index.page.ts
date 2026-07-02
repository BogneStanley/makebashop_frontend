import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { groupSettingsByCategory, SETTINGS_NAV_ITEMS } from './settings-nav';

@Component({
  selector: 'app-settings-index-page',
  imports: [RouterLink],
  templateUrl: './settings-index.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsIndexPage {
  readonly groups = groupSettingsByCategory(SETTINGS_NAV_ITEMS);
}
