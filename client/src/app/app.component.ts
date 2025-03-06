import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  //styleUrls: ['./app.component.css'] Removed for good?????
})
export class AppComponent {
  title = 'client';
  showNavBar = true;

  constructor(private router: Router){
    this.router.events.subscribe(() => {
      this.showNavBar = !this.router.url.includes('/login');
    });
  }
}
