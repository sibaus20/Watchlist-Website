import { Component, OnInit, Input} from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(
    public userService : UserService,
    private router : Router
  ){}

  userName? : string;
  password? : string;

  rUserName? : string;
  rPassword? : string;

  login(){
    const username = this.userName || '';
    const password = this.password || '';
    this.userService.login(username, password).subscribe({
      next: (response) => {
        if(this.userService.currentUser.userName !== 'Guest'){
          this.router.navigate(['/want-watch']);
        }
      },
      error: (error) => console.log('Login Failed',error)
    });
  }
  register(){
    const regUserName = this.rUserName || '';
    const regPassword = this.rPassword || '';
    this.userService.register(regUserName, regPassword).subscribe({
      next: (response) => {
        this.router.navigate(['want-watch']);
      }, 
      error: (error) => {
        if(error.error?.code === 'USERNAME_EXISTS'){
          throw new Error('Username is already taken');
        }
        throw new Error('Registration failed')
      }
    });
  }
  
  ngOnInit(): void {
    this.userName = "admin";
    this.password = "admin";
  }
}
