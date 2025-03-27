import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from 'src/app/models/user';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

  currentUser$: Observable<User> = this.userService.user$;

  constructor(
    private userService: UserService,
    private router: Router
  ){}

  logout(){
    this.userService.logout();
    this.router.navigate(['/login']);//Instead of routerlink in HTML
  }
}
