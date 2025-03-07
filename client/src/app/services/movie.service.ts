import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { movie } from '../models/movie';
import { User } from '../models/user';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

//Service handling movie interactions

@Injectable({ providedIn: 'root' })
export class MovieService {
  private URL : String = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  search(title : string) : Observable<[movie]> {
    let url = this.URL+'/search/'+title;
    return this.http.get<[movie]>(url);
  }







  // EVERYTHING BELOW IS OLD CONTENT


  watchlistMovie(title : string) : Observable<User>{
    let url = this.URL+`/addWatchlist/`+title;
    return this.http.get<User>(url);
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