import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url =  environment.userUrl + '/api/users';
  constructor(private http:HttpClient) { }

  getUser(role: string) {
    return this.http.get(
      `${this.url}?role=${role}`
    )
  }
}
