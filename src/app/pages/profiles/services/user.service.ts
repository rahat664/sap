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

  getUser(role?: string, status?: string) {
    if (role) {
      return this.http.get(
        `${this.url}?role=${role}`
      )
    } else if (status) {
      return this.http.get(
        `${this.url}?status=${status}`
      )
    } else if (role && status) {
      return this.http.get(
        `${this.url}?role=${role}&status=${status}`
      )
    } else {
      return this.http.get(
        `${this.url}`
      )
    }
  }

  addUserFromTransport(body: any) {
    return this.http.post(`${this.url}`, body, {})

  }

  addUser(body: any) {
    return this.http.post(`${this.url}/create`, body, {})
  }

  getUserRoles() {
    return this.http.get(
      `${this.rolesUrl}`
    )
  }

  addDriver(body: any) {
    return this.http.post(`${this.url}/add-driver`, body, {})
  }

  editDriver(body: any) {
    return this.http.put(`${this.url}/edit-driver`, body, {})
  }

  getDriver() {
    return this.http.get(
      `${this.url}/drivers`
    )
  }
}
