import { Injectable } from '@angular/core';
import { auth } from '../firebase.config';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Observable to track the current user
    user$ = new BehaviorSubject<User | null>(null);

    constructor() {
        // Listen to authentication state changes
        auth.onAuthStateChanged((user) => {
            this.user$.next(user);
        });
    }

    // Google Login
    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            throw error;
        }
    }

    // Logout
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign-Out Error:', error);
            throw error;
        }
    }

    // Get current user snapshot
    get currentUser(): User | null {
        return auth.currentUser;
    }
}
