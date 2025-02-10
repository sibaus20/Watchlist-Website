import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { movie } from '../models/movie';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private URL : String = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  searchMovie(title : string) : Observable<User>{
    let url = this.URL+`/search/`+title;
    var ans = this.http.get<User>(url);
    return ans;
  }
  login( userName : String, password : String  ) : Observable<User> {
    let headers = { "Content-Type": "application/x-www-form-urlencoded"};
    console.log("logging into "+userName+" with pass "+password);
    return this.http.post<User>(this.URL + "/login", "userName=" + userName + "&password=" + password, {headers} );
  }
  update(user: User): Observable<User> {
    let headers = { "Content-Type": "application/json" };
    return this.http.post<User>(this.URL + "/update", user, { headers });
  }  
  rewatch(movie:movie,user:User):Observable<User>{
    let headers =  { "Content-Type": "application/json" };
    return this.http.post<User>(this.URL + "/rewatch/"+movie.title, user, { headers });
  }
  users():Observable<[User]>{
    return this.http.get<[User]>(this.URL+"/users")
  }
  sort(filter:string, user:User):Observable<User>{
    let headers =  { "Content-Type": "application/json" };
    return this.http.post<User>(this.URL+'/sort/'+filter,user,{headers});
  }
}