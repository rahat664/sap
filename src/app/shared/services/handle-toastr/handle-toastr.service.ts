import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class HandleToastrService implements OnInit {
  toastrShown: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private toast: HotToastService) {}

  ngOnInit(): void {}

  showSuccess(message: string, title?: string) {
    this.toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#51A351',
        color: 'white',
        padding: '10px',
      },
      iconTheme: {
        primary: '#51A351',
        secondary: 'white',
      },
    });
  }

  showError(message: string, title?: string) {
    this.toast.error(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#BD362F',
        color: 'white',
        padding: '10px',
      },
      iconTheme: {
        primary: '#BD362F',
        secondary: 'white',
      },
    });
  }

  showInfo(message: string, title?: string) {
    this.toast.info(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#fff',
        padding: '10px',
      },
    });
  }

  showWarning(message: string, title?: string) {
    this.toast.warning(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#F89406',
        color: 'white',
        padding: '10px',
      },
    });
  }

  showCustom(message: string, title?: string) {
    this.toast.show(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#F89406',
        color: 'white',
        padding: '10px',
      },
    });
  }
}
