import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit{

  constructor(private userService: UserService){}

  users: User[] = [];

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(){
    this.userService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => console.error('Failed to fetch users')
    })
  };

  //TODO: Make Enabled/Disbaled a button
}
