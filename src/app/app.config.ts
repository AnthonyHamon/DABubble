import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyBo2am1NmepmFPvD2Q38Jv4FNiLGE7xfp0",
        authDomain: "da-bubble-68c64.firebaseapp.com",
        projectId: "da-bubble-68c64",
        storageBucket: "da-bubble-68c64.appspot.com",
        messagingSenderId: "819399956663",
        appId: "1:819399956663:web:88cd8148996d8ac8b25532"
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};
