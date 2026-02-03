import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h1 class="text-4xl font-extrabold text-slate-800 mb-4">Welcome to Gym Matters 🏋️</h1>
      <p class="text-xl text-slate-500 mb-8 max-w-md">
        Your personal AI-powered fitness companion. Sign in to save your custom plans and track your progress across devices.
      </p>
      
      <button (click)="login()" 
        class="flex items-center gap-3 bg-white text-slate-700 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 border border-slate-200 cursor-pointer text-lg">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" class="w-6 h-6">
        Sign in with Google
      </button>

      <p *ngIf="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </div>
  `
})
export class LoginComponent {
    errorMessage: string = '';

    constructor(private authService: AuthService) { }

    async login() {
        try {
            await this.authService.loginWithGoogle();
            // Navigation will be handled by the user$ subscription in App component or Router
        } catch (error) {
            this.errorMessage = 'Failed to sign in. Please try again.';
            console.error(error);
        }
    }
}
