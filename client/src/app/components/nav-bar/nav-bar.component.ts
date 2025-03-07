import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  constructor(
    private userService: UserService,
    private router: Router
  ){}
  public user = this.userService.user$

  logout(){
    this.userService.logout();
    this.router.navigate(['/login']);//Instead of routerlink in HTML
  }


  //DONT FORGET TO ADD SETTINGS BACK TO ADMIN ONLY
}
