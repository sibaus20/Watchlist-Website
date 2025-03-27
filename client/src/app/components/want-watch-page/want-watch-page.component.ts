import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Subscription, Observable, map } from 'rxjs';

import { movie } from 'src/app/models/movie';
import { User } from 'src/app/models/user';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-want-watch-page',
  templateUrl: './want-watch-page.component.html',
  styleUrls: ['./want-watch-page.component.css']
})
export class WantWatchPageComponent implements OnInit, OnDestroy {

  constructor(
    private userService: UserService,
    private router: Router
  ){}
  //Searchbar/Dropdown Vars
  searchInput: string = '';
  searchResults: any[] = [];
  selectedMovie: movie | null = null;
  showDropdown: boolean = false;
  highlightedIndex: number = -1;
  //Data Vars
  wantMovies$: Observable<movie[]> = this.userService.user$.pipe(map(user => user.want));
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void { 
    this.userService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user =>{
      if(user.userName == "Guest") this.router.navigate(['/login']);
    })
  };
  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  };

  
  //Searchbar/Dropdown functs
  onInputChange(){
    if(this.searchInput.length > 2){
      this.userService.search(this.searchInput)
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(results =>{
          this.searchResults = results;
          this.showDropdown = true;
          this.highlightedIndex = -1;
        })
    }else{
      this.searchResults = [];
      this.showDropdown = false;
    }
  };
  selectResult(result: any){
    this.searchInput = result.title;
    this.selectedMovie = result;
    this.showDropdown = false;
  };
  onArrowDown(){
    if(this.highlightedIndex < this.searchResults.length -1){
      this.highlightedIndex++;
    }
  };
  onArrowUp(){
    if(this.highlightedIndex > 0){
      this.highlightedIndex--;
    }
  };
  onEnter(){
    if(this.highlightedIndex >= 0 && this.highlightedIndex < this.searchResults.length){
      this.selectResult(this.searchResults[this.highlightedIndex]);
    }
  };
  onEscape(){
    this.showDropdown = false;
  };
  //Movie Handling Functs
  addWant(){//movie is added to wants in server | If already there returns nothing
    if(!this.selectedMovie){
      alert('Please select a movie first');
      return;
    }
    this.userService.addToWants(this.selectedMovie).subscribe({
      next: (updatedUser) => {
        this.searchInput = '';
        this.selectedMovie = null;
      },
      error: (error) => {
        console.error('Error adding to lists', error);
      }
    });
  };
  addWatched(movie : movie){ 
    console.log("watchedmoviedadata:",movie)
    this.userService.addToWatched(movie).subscribe();
    this.removeWant(movie);
  };
  removeWant(movie : movie){
    this.userService.removeFromWants(movie).subscribe({
      next: (updatedUser) => {
        console.log('Removed ',movie.title," from Wants")
      }
    })
  };
  seeDetails(movie : movie){ //Open movies page
    this.router.navigate(['/details', movie.id], {
      state: {movieData: movie}
    });
  };
  
}
