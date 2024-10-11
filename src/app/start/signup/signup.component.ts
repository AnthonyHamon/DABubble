import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../utils/services/user.service';
import { emailValidator, nameValidator, passwordValidator } from '../../utils/form-validators';
import { ChooesavatarComponent } from '../chooesavatar/chooesavatar.component';
import { Auth, createUserWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../utils/services/channel.service';
import { MessageService } from '../../utils/services/message.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ChooesavatarComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {

  constructor() {
    const formData = sessionStorage.getItem('signupForm');
    if (formData) this.signupForm.setValue(JSON.parse(formData));
    signOut(this.firebaseauth);
  }

  private firestore = inject(Firestore);
  private firebaseauth = inject(Auth);
  private userservice = inject(UsersService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);
  private router: Router = inject(Router);

  public errorEmailExists = '';
  public loggingIn = false;
  public showChooseAvatarMask = false;

  signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, nameValidator()]),
    email: new FormControl('', [Validators.required, emailValidator()]),
    password: new FormControl('', [Validators.required, passwordValidator()]),
    checkboxPP: new FormControl(false, [Validators.required, Validators.requiredTrue,]),
  });


  /**
   * Saves the current signup form data to the session storage.
   * The form data is serialized to a JSON string before being stored.
   * The data can be retrieved later using the key 'signupForm'.
   */
  saveFormDataToSessionStorage() {
    sessionStorage.setItem('signupForm', JSON.stringify(this.signupForm.value));
  }


  /**
   * Handles the submission of the sign-up form.
   * 
   * @param {Event} event - The event triggered by form submission.
   * @returns {Promise<void>} A promise that resolves when the form submission process is complete.
   * 
   * This method performs the following actions:
   * - Prevents the default form submission behavior.
   * - Clears any existing error messages.
   * - Disables the form to prevent multiple submissions.
   * - Extracts the name, email, and password values from the form.
   * - Attempts to register a new user with the provided details.
   * - If an error occurs during registration, handles the error.
   * - If registration is successful, resets the form, removes any stored form data, and handles the success.
   */
  async submitSignUpForm(event: Event) {
    event.preventDefault();
    this.clearAllErrorSpans();
    this.loggingIn = true;
    this.signupForm.disable();
    const name = this.signupForm.value.name || '';
    const email = this.signupForm.value.email || '';
    const password = this.signupForm.value.password || '';
    const error = await this.registerNewUser(name, email, password);
    this.loggingIn = false;
    if (error) this.handleSignupErrors(error);
    else {
      this.signupForm.reset();
      sessionStorage.removeItem('signupForm');
      this.handleSignupSuccess();
    }
  }


  /**
   * Navigates back to the home page after saving form data to session storage.
   * This method first calls `saveFormDataToSessionStorage` to ensure that any
   * form data is preserved in the session storage. Then, it uses the router
   * to navigate to the root path ('/').
   */
  goBack() {
    this.saveFormDataToSessionStorage();
    this.router.navigate(['/']);
  }


  /**
   * Navigates to the policy page after saving the form data to session storage.
   * This method first calls `saveFormDataToSessionStorage` to persist the current form data,
   * and then uses the router to navigate to the '/policy' route.
   */
  goToPolicy() {
    this.saveFormDataToSessionStorage();
    this.router.navigate(['/policy']);
  }


  /**
   * Registers a new user with the provided name, email, and password.
   * 
   * This function performs the following steps:
   * 1. Creates a new user with the provided email and password using Firebase Authentication.
   * 2. Updates the user's profile with the provided display name.
   * 3. Adds a new document to the 'users' collection in Firestore with the user's details.
   * 4. Sends an email verification link to the user.
   * 
   * @param name - The display name of the new user.
   * @param email - The email address of the new user.
   * @param password - The password for the new user.
   * @returns A promise that resolves to an empty string if the registration is successful, or an error message if it fails.
   */
  async registerNewUser(name: string, email: string, password: string): Promise<string> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.firebaseauth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const data = await addDoc(collection(this.firestore, '/users'), { name: name, email: email, online: false, signupAt: serverTimestamp(), avatar: 0 });
      this.implementSomeNewUserStuff(data.id);
      this.userservice.sendEmailVerificationLink();
      return '';
    } catch (error) {
      console.error('userservice/auth: Error registering user(', (error as Error).message, ')');
      return (error as Error).message;
    }
  }


  welcomemessagecontent = `
  <h1>Willkommen bei DABubble!</h1><p><br></p><p><strong>DABubble</strong> ist eine moderne Chat-App für effiziente Kommunikation in Channels und per Direktnachricht. Arbeite im Team oder chatte privat mit Kollegen – flexibel und intuitiv.</p><p><br></p><h2>Was bietet DABubble?</h2><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Channels erstellen</strong>: Bleibe bei Projekten und Themen auf dem Laufenden.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Direktnachrichten</strong>: Führe private Gespräche.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Emoji-Reaktionen</strong>: Verleihe Nachrichten eine persönliche Note.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Suchfunktion</strong>: Finde schnell Nachrichten oder User. Du kannst global suchen – entweder nach Nachrichten im aktuellen Channel oder in allen Channels. Auch die Suche nach Usern und Channels ist möglich.</li></ol><p><br></p><p>Im <span class="highlight-channel" id="isPDY8NAznEARHdJFTyb" contenteditable="false">#Allgemein</span> Channel kannst du generelle Fragen stellen. <span class="highlight-channel" id="0biyIbK3IYw3SaRihcrC" contenteditable="false">#Backend</span> und <span class="highlight-channel" id="LKN74nq0AFkZCqGoLGZN" contenteditable="false">#Front End</span> sind dann für spezielle dinge reserviert.</p><p><br></p><p>Bei Fragen wende Dich gerne an <span class="highlight-user" id="4iqrDSW9hM4hRVQGuMVy" contenteditable="false">@Michael Buschmann</span> , <span class="highlight-user" id="ellfDJEyv2LnT55aYyH3" contenteditable="false">@Peter Wallbaum</span> , <span class="highlight-user" id="codDqlQXNu6QBkrpdR8A" contenteditable="false">@Anthony Hamon</span> oder <span class="highlight-user" id="SVFcGhTwEk94NhptJ7iz" contenteditable="false">@Bela Schramm</span> . </p><p><br></p><p>Viel Spaß mit <strong>DABubble!</strong> Bei Fragen sind wir immer für dich da. Um neue <em>User</em> anzuschreiben, nutze die Suchfunktion.</p>  `;
  
  private async implementSomeNewUserStuff(newUserID: string) {
    const belaID = 'SVFcGhTwEk94NhptJ7iz';
    const selfChatID = await this.channelService.addChatWithUserOnFirestore(newUserID);
    const belaChatID = await this.channelService.addChatWithUserOnFirestore(belaID); // Bela Schramm
    if (belaChatID) {
      const belaChat = this.channelService.getChatByID(belaChatID);
      if (belaChat) {
        this.messageService.addNewMessageToCollection(belaChat, this.welcomemessagecontent, [], belaID);
      }
    }
  }


  /**
   * Handles the success event of choosing an avatar.
   * Displays an informational popover and navigates to the chat content page after a delay.
   */
  successChooseAvatar() {
    document.getElementById('infoPopover')?.showPopover();
    setTimeout(() => {
      this.router.navigate(['/chatcontent']);
    }, 2000);
  }


  /**
   * Handles the successful signup event.
   * 
   * This method is triggered when the signup process completes successfully.
   * It sets the `showChooseAvatarMask` property to `true`, which likely
   * displays a mask or overlay for choosing an avatar.
   */
  handleSignupSuccess() {
    this.showChooseAvatarMask = true;
  }


  /**
   * Handles signup errors by checking the error message and setting appropriate error messages.
   *
   * @param error - The error message received during the signup process.
   */
  handleSignupErrors(error: string) {
    if (error.includes('auth/email-already-in-use')) {
      this.errorEmailExists = 'Diese E-Mail-Adresse ist bereits vergeben.';
    }
  }


  /**
   * Clears all error messages displayed in the signup component.
   * Currently, it resets the error message related to email existence.
   */
  clearAllErrorSpans() {
    this.errorEmailExists = '';
  }


}
