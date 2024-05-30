import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {CustomerCreateModel} from "../components/customer/model/customer-create.model";

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
  addUser(body: any) {
    return this.http.post(`${this.url}`, body , {

    })
  }
  customerCodeValidation(code: any) {
    return this.http.get(`${this.url}/validate-customer-code/${code}`)
  }
}
