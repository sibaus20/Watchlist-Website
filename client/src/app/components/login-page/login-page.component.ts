import { Component, OnInit, Input} from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private userService : UserService,
    private router : Router
  ){}

  @Input() userName? : string;
  @Input() password? : string;

  login(){
    this.userService.login((<HTMLInputElement>document.getElementById("userInput")).value, (<HTMLInputElement>document.getElementById("passInput")).value);
    this.router.navigate(['/want-watch']);
  }
  
  ngOnInit(): void {
    this.userName = "admin";
    this.password = "admin";
  }
}
