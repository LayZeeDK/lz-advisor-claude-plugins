import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.example.com';

  async getUser(id: string): Promise<any> {
    const url = `${this.baseUrl}/users/${id}`;
    return firstValueFrom(this.http.get<any>(url));
  }

  async createUser(data: any): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/users`, data));
  }

  async deleteUser(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/users/${id}`));
  }

  async listUsers(query: string): Promise<any[]> {
    const url = `${this.baseUrl}/users?q=${query}`;
    return firstValueFrom(this.http.get<any[]>(url));
  }
}
