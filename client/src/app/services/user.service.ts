import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private URL : String = 'http://localhost:3000';
  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');//Check for saved user
    if(savedUser){
      this.curUserSubject.next(JSON.parse(savedUser));
    }
  }

  private curUserSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.curUserSubject.asObservable();

  login( userName : String, password : String  ){//Saves server's user to localstorage
    console.log("logging into "+userName+" with pass "+password);
    let headers = { "Content-Type": "application/x-www-form-urlencoded"};
    let userData = this.http.post<User>(this.URL + "/login", "userName=" + userName + "&password=" + password, {headers} 
    ).subscribe({ next: (userFromServer)=> {
      localStorage.setItem('user', JSON.stringify(userFromServer));
      this.curUserSubject.next(userFromServer);
    },
    error:(err) =>{
      console.error('Login error', err);
      alert('Invalid Username or Password');
    }
  });
      //prob delete
    let user:  User = {
        _id: '',
        userName: '',
        password: '',
        admin: false,
        disabled: false,
        want: [],
        watched: []
    };
  }
  logout(){
    localStorage.removeItem('')
    this.curUserSubject.next(null)
  }

  sort(filter:string, user:User){
    let headers =  { "Content-Type": "application/json" };
    let userData = this.http.post<User>(this.URL+'/sort/'+filter,user,{headers});


  }

}
