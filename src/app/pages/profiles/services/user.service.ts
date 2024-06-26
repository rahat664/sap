import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {CustomerCreateModel} from "../components/customer/model/customer-create.model";
import {catchError, map, Observable, throwError} from "rxjs";
import {ApiResponse} from "../../auth/models/response/api-response";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = environment.userUrl + '/api/users';
  rolesUrl = environment.userUrl + '/api/roles';
  departmentsUrl = environment.userUrl + '/api/departments';

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

  getUsers(page: number, status ?: string, search ?: string, department ?: string): Observable<any> {
    // take all possible parameters and return the response
    if (status && !search && !department) {
      return this.http.get(
        `${this.url}/admins?page=${page}&status=${status}`
      )
    } else if (search && !status && !department) {
      return this.http.get(
        `${this.url}/admins?page=${page}&search=${search}`
      )
    } else if (department && !status && !search) {
      return this.http.get(
        `${this.url}/admins?page=${page}&department=${department}`
      )
    } else if (status && search && !department) {
      return this.http.get(
        `${this.url}/admins?page=${page}&status=${status}&search=${search}`
      )
    } else if (status && department && !search) {
      return this.http.get(
        `${this.url}/admins?page=${page}&status=${status}&department=${department}`
      )
    } else if (search && department && !status) {
      return this.http.get(
        `${this.url}/admins?page=${page}&search=${search}&department=${department}`
      )
    } else if (status && search && department) {
      return this.http.get(
        `${this.url}/admins?page=${page}&status=${status}&search=${search}&department=${department}`
      )
    } else {
      return this.http.get(
        `${this.url}/admins?page=${page}`
      )
    }
  }

  addDriver(body: any) {
    return this.http.post(`${this.url}/add-driver`, body, {})
  }

  editDriver(body: any) {
    return this.http.put(`${this.url}/edit-driver`, body, {})
  }

  getDriver(page:number, search?: string) {
    if (search) {
      return this.http.get(
        `${this.url}/drivers?page=${page}&search=${search}`
      )
    } else {
      return this.http.get(
        `${this.url}/drivers?page=${page}`
      )
    }
  }


  private handleError(error: HttpErrorResponse) {

    let message = "";

    if (error.status === 0) {

      message = 'Network connection problem!'
    } else {

      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  changeStatus(id: number, status: string): Observable<any> {

    const payload = {
      id:id,
      status: status
    };

    return this.http.put<ApiResponse>(this.url + '/updateStatus', payload).pipe(map (response => {
        if(response.statusCode == 204){
          return response.message;
        }

        throw new Error(response.message);
      }
    )).pipe(
      catchError(this.handleError)
    );
  }

  getAllDepartments() {
    this.http.get(`${this.departmentsUrl}`)
  }
}
