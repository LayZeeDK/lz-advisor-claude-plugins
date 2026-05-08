import { Component, input, output } from '@angular/core';
import type { User } from '../types/api';

@Component({
  selector: 'app-user-item',
  standalone: true,
  template: `
    <li (click)="select()">
      <span>{{ user().name }}</span>
      <span>{{ user().email }}</span>
    </li>
  `,
})
export class UserItemComponent {
  user = input.required<User>();
  selected = output<User>();

  select() {
    this.selected.emit(this.user());
  }
}
