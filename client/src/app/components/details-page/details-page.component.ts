import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { movie } from 'src/app/models/movie';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent {
movie: movie | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ){
    const navigation = this.router.getCurrentNavigation();
    this.movie = navigation?.extras.state?.['movieData'] as movie || null;
    console.log("Seeing details of: ",this.movie)
  }

  ngOnInit(){
    if(!this.movie){
      this.route.data.subscribe(data =>{
        this.movie = data['movie'] || null;
        if (!this.movie) this.router.navigate(['/want-watch']);
      })
    }
  }

}
