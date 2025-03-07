import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MovieService } from 'src/app/services/movie.service';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-want-watch-page',
  templateUrl: './want-watch-page.component.html',
  styleUrls: ['./want-watch-page.component.css']
})
export class WantWatchPageComponent {

  constructor(
    private movieService: MovieService
  ){}

  searchInput: string = '';
  searchResults: any[] = [];
  showDropdown: boolean = false;
  highlightedIndex: number = -1;




   addWatchlist(){//movie is added to wants in server, user returned
      this.movieService.watchlistMovie(this.searchInput).subscribe(results => {
        //this.curUser = results;
        //this.updateLists();
      });
    } //NOTE: adding already added movies will return nothing
  
    onInputChange(){
      if(this.searchInput.length > 2){
        this.movieService.search(this.searchInput)
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
    }
  
    selectResult(result: any){
      this.searchInput = result.title;
      this.showDropdown = false;
    }
    onArrowDown(){
      if(this.highlightedIndex < this.searchResults.length -1){
        this.highlightedIndex++;
      }
    }
    onArrowUp(){
      if(this.highlightedIndex > 0){
        this.highlightedIndex--;
      }
    }
    onEnter(){
      if(this.highlightedIndex >= 0 && this.highlightedIndex < this.searchResults.length){
        this.selectResult(this.searchResults[this.highlightedIndex]);
      }
    }
    onEscape(){
      this.showDropdown = false;
    }
  
}
