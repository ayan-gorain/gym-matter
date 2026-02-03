import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.html'
})
export class NavBar {
  @Input() currentView: string = 'dashboard';
  @Output() navigate = new EventEmitter<string>();

  onNavigate(view: string) {
    this.navigate.emit(view);
  }
}
