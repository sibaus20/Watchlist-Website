import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../models/user';
import { movie } from '../models/movie';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly URL : String = `http://localhost:3000`;
  private readonly AUTH_KEY = 'auth_token';
  private jwtHelper = new JwtHelperService;
  private readonly GUEST: User ={
    _id: '',
    userName: 'Guest',
    admin: false,
    disabled: true,
    want: [],
    watched: []
  };
  private userSubject: BehaviorSubject<User>;
  public user$: Observable<User>;

  constructor(private http: HttpClient) {//User is either already saved or Guest for login
    const initialUser = this.getValidatedUser();
    this.userSubject = new BehaviorSubject<User>(initialUser);
    this.user$ = this.userSubject.asObservable();

  }

  public search(title : string) : Observable<movie[]> {//Takes title gives movies
    return this.http.get<movie[]>(`${this.URL}/search/${title}`);
  }

  public get currentUser(): User{ 
    return this.userSubject.getValue();
  }
  private getValidatedUser(): User { //Ensures no corrupt data
    //Contains both Security token & cleaned User 
    const tokens = localStorage.getItem(this.AUTH_KEY);
    if(!tokens || this.jwtHelper.isTokenExpired(tokens)){
      return this.GUEST;
    }
    try {
      const decoded = this.jwtHelper.decodeToken(tokens);
      let valUser = this.validateUser(decoded);
      console.log('Validated User: ',valUser);
      return valUser;
    }catch(error){
      console.error('Invalid UserData', error);
      return this.GUEST;
    }
  }
  private validateUser(tokenData: any):User { 
    return {
      _id: tokenData?._id || this.GUEST._id,
      userName: tokenData?.userName || this.GUEST.userName,
      admin: Boolean(tokenData?.admin),
      disabled: Boolean(tokenData?.disabled),
      want: Array.isArray(tokenData?.want) ? tokenData.want : [],
      watched: Array.isArray(tokenData?.watched) ? tokenData.watched : []
    }
  }
  login( userName : String, password : String ) : Observable<{ token: string }> {//Saves server's user to localstorage
    console.log("logging into "+userName+" with pass "+password);
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    const body = {userName, password};
    return this.http.post<{token: string}>(`${this.URL}/login`, body, {headers})
    .pipe(
      tap(response => {
        localStorage.setItem(this.AUTH_KEY, response.token);
        const decodedUser = this.jwtHelper.decodeToken(response.token);
        this.userSubject.next(this.validateUser(decodedUser));
      }),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => error);
      })
    );
  }
  logout(){
    localStorage.removeItem(this.AUTH_KEY);
    this.userSubject.next(this.GUEST)
  }
  
  private getAuthHeaders(): HttpHeaders{
    const token = localStorage.getItem(this.AUTH_KEY);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }
  register( userName: String, password: String){
    console.log("registering: ", userName, 'witpass', password);
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    let body = { userName, password}
    return this.http.post<{token: string}>(`${this.URL}/register`, body, {headers})
    .pipe(
      tap(response => {
        localStorage.setItem(this.AUTH_KEY, response.token);
        const decodedUser = this.jwtHelper.decodeToken(response.token);
        this.userSubject.next(this.validateUser(decodedUser));
      }),
      catchError(error =>{
        if(error.error?.code === 'USERNAME_EXISTS'){
          throw new Error('Username already taken')
        }
        console.error('Registery error', error);
        return throwError(() => error)
      })
    )
  }
  //Apends movie to wants first, call again to reach watched 
  public addToWants(movie: movie) : Observable<User>{
    if(this.currentUser.userName == "Guest"){
      alert('Not logged in');
      return throwError(() => new Error('User not logged in'))
    }
    return this.http.post<User>(
    `${this.URL}/addWant`, { movie }, { headers: this.getAuthHeaders() }).pipe(
      tap (updatedUser => this.userSubject.next(updatedUser)),
      catchError(error => {
        console.error('Error adding to Want list:', error);
        return throwError(() => new Error('Failed adding to Wants'));
      })
    );
  }
  public removeFromWants(movie: movie){
    return this.http.delete<User>(
    `${this.URL}/removeWant/${movie.id}`, { headers: this.getAuthHeaders() } ).pipe(
      tap (updatedUser => {
        this.userSubject.next(updatedUser)
        console.log('wantRemoved from User',updatedUser)
      }),
      catchError(error => { return throwError(() => new Error('Failed to remove from Wants'))})
    );
  }
  public addToWatched(movie: movie){
    if(this.currentUser.userName == "Guest"){
      alert('Not logged in');
      return throwError(() => new Error('User not logged in'))
    }
    return this.http.post<User>(
    `${this.URL}/addWatched`, { movie }, { headers: this.getAuthHeaders() }).pipe(
      tap (updatedUser => this.userSubject.next(updatedUser)),
      catchError(error => {
        console.error('Error adding to Watched list:', error);
        return throwError(() => new Error('Failed adding to Watched'));
      })
    );
  }
  public removeFromWatched(movie: movie){
    return this.http.delete<User>(
      `${this.URL}/removeWatched/${movie.id}`, { headers: this.getAuthHeaders() } ).pipe(
        tap (updatedUser => this.userSubject.next(updatedUser)),
        catchError(error => { return throwError(() => new Error('Failed to remove from Watched'))})
      );
  }
  public rewatchMovie(movie: movie){
    return this.http.post<User>(
      `${this.URL}/rewatch/${movie.id}`, {}, {headers: this.getAuthHeaders() } ).pipe(
        tap (updatedUser => this.userSubject.next(updatedUser)),
        catchError(error => { return throwError(() => new Error('Failed to rewatch'))})
      );
  }
  public getUsers(){
    return this.http.get<User[]>(
      `${this.URL}/users`, {headers: this.getAuthHeaders() } ).pipe(
        catchError(error => {return throwError(() => new Error('Failed to get users'))})
      );
  }

  sort(filter:string){ //Only reOrdering so no server
    const currentUser = this.currentUser;
    if(currentUser.userName == 'Guest') return ;
    const sortedList = currentUser.watched;
    if(filter == 'date'){
      sortedList.sort((a, b) => {
        const dateA = new Date(a.released).getTime();
        const dateB = new Date(b.released).getTime();
        return dateA - dateB;
      })
    } else if(filter == 'title'){
      sortedList.sort((a,b) => a.title.localeCompare(b.title));
    }
    console.log('List after sort: ',sortedList)
    const updatedUser: User = {
      ...currentUser,
      watched: sortedList
    }

  }

}
