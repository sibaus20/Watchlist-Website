import { Component } from '@angular/core';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-already-watched-page',
  templateUrl: './already-watched-page.component.html',
  styleUrls: ['./already-watched-page.component.css']
})
export class AlreadyWatchedPageComponent {
  constructor(private userService: UserService){}
    public user = this.userService.user$
 

  //returns user with ordered watched[]
  filterBy(filter:string){//watched page
    this.userService.sort(filter,this.user).subscribe(res=>{
      //console.log("newlyFILTERED",res);
      this.user=res;
      this.updateLists();
    })
  }
}
