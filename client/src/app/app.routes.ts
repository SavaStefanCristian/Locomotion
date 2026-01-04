import { Routes } from '@angular/router';

import { HomePage } from './pages/home.page/home.page';
import { PlayPage } from './pages/play.page/play.page';
import { KeyPage } from './pages/key.page/key.page';
import { SettingsPage } from './pages/settings.page/settings.page';
import { ResultsPage } from './pages/results.page/results.page';
import { TutorialPage } from './pages/tutorial.page/tutorial.page';
import {ConquestPage} from './pages/conquest.page/conquest.page';
import {ConquestResultsPage} from './pages/conquest-results.page/conquest-results.page';
import {CapitalismPage} from './pages/capitalism.page/capitalism.page';
import {CapitalismResultsPage} from './pages/capitalism-results.page/capitalism-results.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'play', component: PlayPage },
  { path: 'key', component: KeyPage },
  { path: 'settings', component: SettingsPage },
  { path: 'results', component: ResultsPage },
  { path: 'tutorial', component: TutorialPage },
  { path: 'conquest', component: ConquestPage },
  { path: 'conquest-results', component: ConquestResultsPage },
  { path: 'capitalism', component: CapitalismPage },
  { path: 'capitalism-results', component: CapitalismResultsPage },

  { path: '**', redirectTo: '' },
];
