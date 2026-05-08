import { Component, computed, input, output } from '@angular/core';
import { UserItemComponent } from './user-item.component';
import type { User } from '../types/api';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [UserItemComponent],
  template: `
    <ul>
      @for (user of users(); track user.id) {
        <app-user-item [user]="user" (selected)="onSelected($event)" />
      }
    </ul>
    <p>Total: {{ count() }}</p>
  `,
})
export class UserListComponent {
  users = input.required<User[]>();
  selected = output<User>();

  count = computed(() => this.users().length);

  onSelected(user: User) {
    this.selected.emit(user);
  }
}
