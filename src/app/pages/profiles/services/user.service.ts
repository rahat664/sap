import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../../auth/models/response/api-response';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  url = environment.userUrl + '/api/users';
  rolesUrl = environment.userUrl + '/api/roles';
  departmentsUrl = environment.userUrl + '/api/departments';
  permissionsUrl = environment.userUrl + '/api/permissions';

  constructor(private http: HttpClient) {}

  getUser(role?: string, status?: string) {
    if (role) {
      return this.http.get(`${this.url}?role=${role}`);
    } else if (status) {
      return this.http.get(`${this.url}?status=${status}`);
    } else if (role && status) {
      return this.http.get(`${this.url}?role=${role}&status=${status}`);
    } else {
      return this.http.get(`${this.url}`);
    }
  }

  addUserFromTransport(body: any) {
    return this.http.post(`${this.url}`, body, {});
  }

  addUser(body: any) {
    return this.http.post(`${this.url}/create`, body, {});
  }

  getUserRoles() {
    return this.http.get(`${this.rolesUrl}`);
  }

  getUsers(
    page: number,
    size?: number,
    status?: string,
    search?: string,
    department?: string
  ): Observable<any> {
    const params: any = { page };

    if (size) {
      params.size = size;
    }
    if (status) {
      params.status = status;
    }
    if (search) {
      params.search = search;
    }
    if (department) {
      params.department = department;
    }

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return this.http.get(`${this.url}/admins?${queryString}`);
  }

  getTransporter(page: number, size: number, search?: string): Observable<any> {
    let apiUrl = `${this.url}/transporters?page=${page}&size=${size}`;

    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get(apiUrl);
  }

  addDriver(body: any) {
    return this.http.post(`${this.url}/add-driver`, body, {});
  }

  editDriver(body: any) {
    return this.http.put(`${this.url}/edit-driver`, body, {});
  }

  getDriver(page: number, size: number, search?: string): Observable<any> {
    let apiUrl = `${this.url}/drivers?page=${page}&size=${size}`;

    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get(apiUrl);
  }

  private handleError(error: HttpErrorResponse) {
    let message = '';

    if (error.status === 0) {
      message = 'Network connection problem!';
    } else {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  changeStatus(id: number, status: string): Observable<any> {
    const payload = {
      id: id,
      status: status,
    };

    return this.http
      .put<ApiResponse>(this.url + '/updateStatus', payload)
      .pipe(
        map(response => {
          if (response.statusCode == 204) {
            return response.message;
          }

          throw new Error(response.message);
        })
      )
      .pipe(catchError(this.handleError));
  }

  getAllDepartments() {
    this.http.get(`${this.departmentsUrl}`);
  }

  deleteDriverFiles(deletedDriverFiles: any, id: number) {
    return this.http.delete(
      `${this.url}/${id}/documents?documentUrl=${deletedDriverFiles}`,
      deletedDriverFiles
    );
  }

  getHelpers(page: number, size: number, search?: string): Observable<any> {
    let apiUrl = `${this.url}/helpers?page=${page}&size=${size}`;

    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get(apiUrl);
  }

  getUserPermissions() {
    return this.http.get(`${this.permissionsUrl}`);
  }
}
