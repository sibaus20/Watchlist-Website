import { Component } from '@angular/core';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  constructor(private userService: UserService){}
  public user = this.userService.user$


  logout(){
    //reset localstorage, TOOODOO  redirects to login
    this.userService.logout();
    
    
  }

}
