import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../utils/services/user.service';
import { ChannelService } from '../../utils/services/channel.service';
import { MessageService } from '../../utils/services/message.service';
import { Channel } from '../../shared/models/channel.class';
import { MessageviewexampleComponent } from '../../examples/messageviewexample/messageviewexample.component';
import { NavigationService } from '../../utils/services/navigation.service';
import { Chat } from '../../shared/models/chat.class';
import { Message } from '../../shared/models/message.class';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MessageviewexampleComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  // für service debug ====================================================

  public channelservice = inject(ChannelService);
  public messageservice = inject(MessageService);

  
  public navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.change$.subscribe((change) => {
      this.cdr.detectChanges();
    });
  }

  constructor(private cdr: ChangeDetectorRef) { }

  public name: string = '';
  public description: string = '';

  getTitle(object: Channel | Chat | Message | undefined): string {
    if (object instanceof Channel) return object.name;
    if (object instanceof Message) return 'Messageanswers of ' + this.userservice.getUserByID(object.creatorID)?.name;
    if (object instanceof Chat) return 'Chat with ' + this.getChatPartner(object);
    return '';
  }

  getChatPartner(object: Chat): string | undefined {
    const chatPartnerID = object.memberIDs.find(id => id !== this.userservice.currentUser?.id);
    if (chatPartnerID) return this.userservice.getUserByID(chatPartnerID)?.name;
    return 'Unknown Partner';
  }

  addNewChannel() {
    this.channelservice.addNewChannelToFirestore(this.name, this.description, this.userservice.getAllUserIDs());
  }

  public messagecontent = '';

  addMessageToChannel(channelNumber: number) {
    this.messageservice.addNewMessageToChannel(this.channelservice.channels[channelNumber], this.messagecontent);
  }

  updateChannel(channelNumber: number) {
    this.channelservice.updateChannelOnFirestore(this.channelservice.channels[channelNumber], { memberIDs: [this.userservice.getAllUserIDs()[0]], description: this.description });
  }

  setCurrentChannel(newChannel: Channel) {
    this.navigationService.setMainMessageObject(newChannel);
  }

  // ======================================================================

  public userservice = inject(UsersService);
  private router: Router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });


  submitLoginForm(event: Event) {
    event.preventDefault();
    const email = this.loginForm.value.email || '';
    const password = this.loginForm.value.password || '';
    this.userservice.loginUser(email, password)
      .then(() => {
        this.router.navigate(['/chatcontent']);
      })
      .catch((error) => {
        console.error('Error logging in:', error);
      });
  }

}
