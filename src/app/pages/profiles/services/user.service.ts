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

  getUsers(page: number): Observable<any> {
    return this.http.get<ApiResponse>(this.url + '/admins?page='+page).pipe(map((response) => {

        return response.data;

      }),
      catchError(this.handleError));
  }

  addDriver(body: any) {
    return this.http.post(`${this.url}/add-driver`, body, {})
  }

  editDriver(body: any) {
    return this.http.put(`${this.url}/edit-driver`, body, {})
  }

  getDriver(page:number) {
    return this.http.get(
      `${this.url}/drivers?page=${page}`
    )
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
