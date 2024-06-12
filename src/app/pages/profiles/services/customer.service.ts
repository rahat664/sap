import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  url =  environment.userUrl + '/api/customers';
  constructor(private http: HttpClient) { }

  getCustomer() {
    return this.http.get(
      `${this.url}`
    )
  }

  addCustomer(body: any) {
    return this.http.post(`${this.url}`, body , {
    })
  }
  customerCodeValidation(code: any) {
    return this.http.get(`${this.url}/validate-customer-code/${code}`)
  }

  searchCustomer(searchValue?: string , phone?: string) {
    if (searchValue) {
      return this.http.get(
        `${this.url}?search=${searchValue}`
      )
    } else if (phone) {
      return this.http.get(
        `${this.url}?phone=${phone}`
      )
    } else {
      return this.http.get(
        `${this.url}`
      )
    }
  }
}
