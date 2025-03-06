import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MoviesComponent } from './movies/movies.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { WantWatchPageComponent } from './components/want-watch-page/want-watch-page.component';
import { AlreadyWatchedPageComponent } from './components/already-watched-page/already-watched-page.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';

@NgModule({
  declarations: [
    AppComponent,
    MoviesComponent,
    LoginPageComponent,
    NavBarComponent,
    WantWatchPageComponent,
    AlreadyWatchedPageComponent,
    SettingsPageComponent,
    DetailsPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
