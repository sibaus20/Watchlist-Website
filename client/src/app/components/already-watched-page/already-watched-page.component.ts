import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

import { movie } from 'src/app/models/movie';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-already-watched-page',
  templateUrl: './already-watched-page.component.html',
  styleUrls: ['./already-watched-page.component.css']
})
export class AlreadyWatchedPageComponent {
  constructor(
    private userService: UserService,
    private router: Router
  ){}

  watchedMovies$: Observable<movie[]> = this.userService.user$.pipe(map(user => user.watched));

  rewatch(movie:movie){
    this.userService.rewatchMovie(movie).subscribe({
      next: (updatedUser) =>{
        console.log('Rewatched ', movie.title)
      }
    })
  }
  seeDetails(movie:movie){
    this.router.navigate(['/details',movie.id], {
      state: {movieData: movie}
    })
  }
  removeWatched(movie:movie){
    this.userService.removeFromWatched(movie).subscribe({
      next: (updatedUser) => {
        console.log('Removed ',movie.title, ' from Watched')
      }
    })
  }

  //returns user with ordered watched[]
  filterBy(filter:string){//watched page
    this.userService.sort(filter);
  }
}
