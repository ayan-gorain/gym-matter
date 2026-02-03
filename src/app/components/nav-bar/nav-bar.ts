import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.html'
})
export class NavBar {
  @Input() currentView: string = 'dashboard';
  @Input() user: User | null = null;
  @Output() navigate = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  onNavigate(view: string) {
    this.navigate.emit(view);
  }
}
