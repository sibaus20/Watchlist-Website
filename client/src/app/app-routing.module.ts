import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { WantWatchPageComponent } from './components/want-watch-page/want-watch-page.component';
import { AlreadyWatchedPageComponent } from './components/already-watched-page/already-watched-page.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},//<router-outlet> is initially login
  {path: 'login', component: LoginPageComponent},
  {path: 'want-watch', component: WantWatchPageComponent},
  {path: 'already-watched', component: AlreadyWatchedPageComponent},
  {path: 'settings', component: SettingsPageComponent},
  {path: 'details', component: DetailsPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
