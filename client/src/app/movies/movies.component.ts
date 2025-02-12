import { Component, OnInit, Input , ChangeDetectorRef } from '@angular/core';
import  {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { movie } from '../models/movie';
import { user } from '../models/user';

import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit{

  @Input() userName? : string;
  @Input() password? : string;

  searchInput: string = '';
  searchResults: any[] = [];
  showDropdown: boolean = false;
  highlightedIndex: number = -1;

  constructor(
    private movieService : MovieService,
    private cd: ChangeDetectorRef
  ){}
  
  public curUser:  user = {
    _id: '',
    userName: '',
    password: '',
    admin: false,
    disabled: false,
    want: [],
    watched: []
  };

  ngOnInit(): void {
      this.userName = "admin";
      this.password = "admin";
      this.loginView();
  }
  login() {
    this.movieService.login((<HTMLInputElement>document.getElementById("userInput")).value, (<HTMLInputElement>document.getElementById("passInput")).value).subscribe(user =>{
      if(user){
        //console.log("logged in",user);
        this.todoView();
        this.curUser = user;
        this.updateUserlist();
        this.updateUser(this.curUser)
      }
    });
  }

  logout(){
    //console.log("LOGOUT");
    //reset local data
    this.curUser = {
      _id: '',
      userName: '',
      password: '',
      admin: false,
      disabled: false,
      want: [],
      watched: []
    };
    this.loginView();
  }

  printmovies(){
    console.log("USER MOVIES ARE");
    console.log(this.curUser.want);
    console.log(this.curUser.watched);
  }

  addWatchlist(){//movie is added to wants in server, user returned
    //console.log("searching for", this.searchInput);
    //this.printmovies();

    this.movieService.watchlistMovie(this.searchInput).subscribe(results => {
      this.curUser = results;
      this.updateLists();
    });
  }

  onInputChange(){
    if(this.searchInput.length > 2){
      this.movieService.search(this.searchInput)
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(results =>{
          console.log(results);
          this.searchResults = results;
          this.showDropdown = true;
        })
    }


  }







  updateLists(){
    //reset todoTable
    let todoTable = document.getElementById("todoTable") as HTMLTableElement;
    let todoBody = todoTable.querySelector('tbody');
    while(todoBody!.firstChild){
      todoBody?.removeChild(todoBody.firstChild);
    }
    //reset watchedTable
    let watchedTable = document.getElementById('watchedTable') as HTMLTableElement;
    let watchedBody = watchedTable.querySelector('tbody');
    while(watchedBody!.firstChild){
      watchedBody?.removeChild(watchedBody.firstChild);
    }
    let wantMovies = this.curUser.want;
    let watchedMovies = this.curUser.watched;
    //Want Table Setup
    wantMovies.forEach(movie =>{
      let row = document.createElement('tr')
      let c1 = row.appendChild(document.createElement('td'));
      c1.innerHTML = movie.title;//div
      let c2 = row.appendChild(document.createElement('td'));
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.style.color = "black";
      btn.style.backgroundColor = "lightgrey"
      btn.style.border = "5px black solid"
      btn.style.borderRadius = "30%";
      btn.innerHTML = 'Add Watched'
      btn.addEventListener('click', ()=>{
        this.addWatched(movie);
      })
      c2.appendChild(btn);//div
      let c3 = row.appendChild(document.createElement('td'));
      let btn2 = document.createElement('button');
      btn2.type = 'button';
      btn2.className = 'btn';
      btn2.style.color = "black";
      btn2.style.backgroundColor = "lightgrey"
      btn2.style.border = "5px black solid"
      btn2.style.borderRadius = "30%";
      btn2.addEventListener('click', () =>{
        this.seeDetails("want",movie);
      })
      btn2.innerHTML = 'See Details';
      c3.appendChild(btn2);//div
      let c4 = row.appendChild(document.createElement('td'));
      let btn3 = document.createElement('button');
      btn3.type = 'button';
      btn3.className = 'btn';
      btn3.style.color = "black";
      btn3.style.backgroundColor = "lightgrey"
      btn3.style.border = "5px black solid"
      btn3.style.borderRadius = "30%";
      btn3.addEventListener('click', ()=>{
        this.remove("want", movie);
      })
      btn3.innerHTML = 'Remove';
      c4.appendChild(btn3);
      document.getElementById('todoTable')!.getElementsByTagName('tbody')[0].appendChild(row);
    })
    //Watched table setup
    watchedMovies.forEach(movie =>{
      let row = document.createElement('tr')
      let c1 = row.appendChild(document.createElement('td'));
      c1.innerHTML = movie.title;
      let c2 = row.appendChild(document.createElement('td'));
      c2.innerHTML = (""+movie.watchDate).substring(0,10);
      let c3 = row.appendChild(document.createElement('td'));
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.style.color = "black";
      btn.style.backgroundColor = "lightgrey"
      btn.style.border = "5px black solid"
      btn.style.borderRadius = "30%";
      btn.addEventListener('click', ()=>{
        this.rewatch(movie);
      })
      btn.innerHTML = "Rewatch";
      c3.appendChild(btn);
      let c4 = row.appendChild(document.createElement('td'));
      let btn3 = document.createElement('button');
      btn3.type = 'button';
      btn3.className = 'btn';
      btn3.style.color = "black";
      btn3.style.backgroundColor = "lightgrey"
      btn3.style.border = "5px black solid"
      btn3.style.borderRadius = "30%";
      btn3.addEventListener('click', () =>{
        this.seeDetails('',movie);
      })
      btn3.innerHTML = 'See Details';
      c4.appendChild(btn3);
      let c5 = row.appendChild(document.createElement('td'));
      let btn4 = document.createElement('button');
      btn4.type = 'button';
      btn4.className = 'btn';
      btn4.style.color = "black";
      btn4.style.backgroundColor = "lightgrey"
      btn4.style.border = "5px black solid"
      btn4.style.borderRadius = "30%";
      btn4.addEventListener('click', ()=>{
        this.remove("watched", movie);
      })
      btn4.innerHTML = 'Remove';
      c5.appendChild(btn4);
      document.getElementById('watchedTable')!.getElementsByTagName('tbody')[0].appendChild(row);
    })
  }

  updateUserlist(){
    this.movieService.users().subscribe(users=>{
      //console.log("USERLIST",users);
      let userTable = document.getElementById("settingsTable") as HTMLTableElement;
      let userBody = userTable.querySelector('tbody');
      while(userBody!.firstChild){
        userBody?.removeChild(userBody.firstChild);
      }

      users.forEach(user =>{
        let row = document.createElement('tr')
        let c1 = row.appendChild(document.createElement('td'));
        c1.innerHTML = ""+user.userName;
        let c2 = row.appendChild(document.createElement('td'));
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.style.color = "black";
        btn.style.border = "5px black solid"
        btn.style.borderRadius = "30%";
        btn.addEventListener('click', ()=>{
          this.disableUser(user);
          if(btn.innerHTML == "Enable"){
            btn.innerHTML = "Disable";
            btn.style.backgroundColor = "red";
          }else{
            btn.innerHTML = "Enable";
            btn.style.backgroundColor = "lightgreen";
          }
        })
        if(user.disabled){
          btn.innerHTML = "Enable";
          btn.style.backgroundColor = "lightgreen";
        }else{
          btn.innerHTML = "Disable";
          btn.style.backgroundColor = "red";
        }
        c2.appendChild(btn);
        document.getElementById('settingsTable')!.getElementsByTagName('tbody')[0].appendChild(row);
      })
    })
  }
  //Update watched time, returns user
  rewatch(movie : movie){ 
    //console.log("REWATCHING ",movie); 
    this.curUser.watched.forEach(mov =>{
      if(movie.title == mov.title){
          this.movieService.rewatch(mov,this.curUser).subscribe((res)=>{
          this.curUser = res;
          this.updateUser(this.curUser);
        });
      }
    });
  }
  addWatched(movie : movie){
    //console.log("ADDING",movie);
    //this.printmovies();
    this.remove('want',movie);
    this.curUser.watched.push(movie);
    this.updateUser(this.curUser);
  }
  seeDetails(list:string, movie : movie){
    document.getElementById('title')!.innerHTML = movie.title;
    document.getElementById('description')!.innerHTML = movie.description;
    document.getElementById('released')!.innerHTML = movie.released;
    if(list == "want"){
      document.getElementById('watched')!.innerHTML = "Haven't seen this one yet!";
    }else{
      document.getElementById('watched')!.innerHTML = (""+movie.watchDate).substring(0,10);
    } 
    this.detailsView();
  }
  remove(list : string, movie : movie){//list is either want or watched
    //console.log("REMOVINGFROM"+list, movie);
    //this.printmovies();
    if(list == "want"){
      let c=0;
      this.curUser.want.forEach(rmovie =>{
        if(rmovie.title == movie.title){
          this.curUser.want.splice(c,1)
        }
        c++;
      })
    }else{//delete a watched movie
      let c=0;
      this.curUser.watched.forEach(rmovie =>{
        if(rmovie.title == movie.title){
          this.curUser.watched.splice(c,1)
        }
        c++;
      })
    }
    //console.log("AFTER REMOVING");
    //this.printmovies();
    this.updateUser(this.curUser);
  }
  //returns user with ordered watched[]
  filterBy(filter:string){//watched page
    this.movieService.sort(filter,this.curUser).subscribe(res=>{
      //console.log("newlyFILTERED",res);
      this.curUser=res;
      this.updateLists();
    })
  }
  //settings for admin
  disableUser(user : user){
    user.disabled = !user.disabled;
    //console.log("afterDISABLEUSER",user);
    this.updateUser(user);
  }
  updateUser(user : user){
    //console.log("UPDATINGUSER",user );
    this.movieService.update(user).subscribe(user=>{
      if(this.curUser._id == user._id){
        this.curUser=user;
      }
      this.cd.detectChanges();
    });
    this.updateLists();
  }

  watchedView(){
    document.getElementById("nav")!.style.display="block";
    document.getElementById("todoPage")!.style.display="none";
    document.getElementById("watchedPage")!.style.display="block";
    document.getElementById("loginPage")!.style.display="none";
    document.getElementById("detailsPage")!.style.display="none";
    document.getElementById("settingsPage")!.style.display="none";
  }
  todoView(){
    document.getElementById("nav")!.style.display="block";
    document.getElementById("todoPage")!.style.display="block";
    document.getElementById("watchedPage")!.style.display="none";
    document.getElementById("loginPage")!.style.display="none";
    document.getElementById("detailsPage")!.style.display="none";
    document.getElementById("settingsPage")!.style.display="none";
  }
  loginView(){
    document.getElementById("nav")!.style.display="none";
    document.getElementById("todoPage")!.style.display="none";
    document.getElementById("watchedPage")!.style.display="none";
    document.getElementById("loginPage")!.style.display="block";
    document.getElementById("detailsPage")!.style.display="none";
    document.getElementById("settingsPage")!.style.display="none";
  }
  detailsView(){
    document.getElementById("nav")!.style.display="block";
    document.getElementById("todoPage")!.style.display="none";
    document.getElementById("watchedPage")!.style.display="none";
    document.getElementById("loginPage")!.style.display="none";
    document.getElementById("detailsPage")!.style.display="block";
    document.getElementById("settingsPage")!.style.display="none";

  }
  settingsView(){
    document.getElementById("nav")!.style.display="block";
    document.getElementById("todoPage")!.style.display="none";
    document.getElementById("watchedPage")!.style.display="none";
    document.getElementById("loginPage")!.style.display="none";
    document.getElementById("detailsPage")!.style.display="none";
    document.getElementById("settingsPage")!.style.display="block";
  }
}
