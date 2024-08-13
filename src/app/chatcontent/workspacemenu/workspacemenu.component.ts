import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../utils/services/user.service';
import { User } from '../../shared/models/user.class';
import { ChannelService } from '../../utils/services/channel.service';
import { Channel } from '../../shared/models/channel.class';

@Component({
  selector: 'app-workspacemenu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workspacemenu.component.html',
  styleUrl: './workspacemenu.component.scss',
})
export class WorkspacemenuComponent implements OnInit {
  public userservice = inject(UsersService);
  public channelservice = inject(ChannelService);
  public users: User[] = [];
  public channels: Channel[] = [];

  ngOnInit(): void {}
}
