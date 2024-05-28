import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToggleResponsiveService {
  isSidebarOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor() { }
}
