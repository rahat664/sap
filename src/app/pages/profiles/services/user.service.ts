import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {CustomerCreateModel} from "../components/customer/model/customer-create.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = environment.userUrl + '/api/users';
  rolesUrl = environment.userUrl + '/api/roles';

  constructor(private http: HttpClient) {
  }

  getUser(role?: string) {
    if (role) {
      return this.http.get(
        `${this.url}?role=${role}`
      )
    } else {
      return this.http.get(
        `${this.url}`
      )
    }
  }

  addUser(body: any) {
    return this.http.post(`${this.url}`, body, {})
  }

  getUserRoles() {
    return this.http.get(
      `${this.rolesUrl}`
    )
  }

  addDriver(body: any) {
    return this.http.post(`${this.url}/add-driver`, body, {})
  }
}
