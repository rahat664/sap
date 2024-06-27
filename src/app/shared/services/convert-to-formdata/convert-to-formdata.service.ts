import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConvertToFormdataService {
  constructor() {}

  convertToFormData(data: any): FormData {
    const formData = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            formData.append(`${key}[]`, value[i]);
          }
        } else {
          formData.append(key, value);
        }
      }
    }

    return formData;
  }
}
