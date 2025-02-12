import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { movie } from '../models/movie';
import { user } from '../models/user';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

//Service handling server interaction

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private URL : String = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  search(title : string) : Observable<[movie]> {
    let url = this.URL+'/search/'+title;
    return this.http.get<[movie]>(url);
  }

  watchlistMovie(title : string) : Observable<user>{
    let url = this.URL+`/addWatchlist/`+title;
    return this.http.get<user>(url);
  }
  login( userName : String, password : String  ) : Observable<user> {
    console.log("logging into "+userName+" with pass "+password);

    let headers = { "Content-Type": "application/x-www-form-urlencoded"};
    return this.http.post<user>(this.URL + "/login", "userName=" + userName + "&password=" + password, {headers} );
  }
  update(user: user): Observable<user> {
    let headers = { "Content-Type": "application/json" };
    return this.http.post<user>(this.URL + "/update", user, { headers });
  }  
  rewatch(movie:movie,user:user):Observable<user>{
    let headers =  { "Content-Type": "application/json" };
    return this.http.post<user>(this.URL + "/rewatch/"+movie.title, user, { headers });
  }
  users():Observable<[user]>{
    return this.http.get<[user]>(this.URL+"/users")
  }
  sort(filter:string, user:user):Observable<user>{
    let headers =  { "Content-Type": "application/json" };
    return this.http.post<user>(this.URL+'/sort/'+filter,user,{headers});
  }
}