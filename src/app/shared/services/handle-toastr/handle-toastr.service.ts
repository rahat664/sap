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

  private getBaseOptions() {
    return {
      duration: 3000,
      position: 'top-right' as const,
      dismissible: true,
      closeStyle: {
        filter: 'invert(1)',
        opacity: '0.9',
      },
    };
  }

  showSuccess(message: string, title?: string) {
    this.toast.success(message, {
      ...this.getBaseOptions(),
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
      ...this.getBaseOptions(),
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
      ...this.getBaseOptions(),
      style: {
        backgroundColor: '#fff',
        padding: '10px',
      },
    });
  }

  showWarning(message: string, title?: string) {
    this.toast.warning(message, {
      ...this.getBaseOptions(),
      style: {
        backgroundColor: '#F89406',
        color: 'white',
        padding: '10px',
      },
    });
  }

  showCustom(message: string, title?: string) {
    this.toast.show(message, {
      ...this.getBaseOptions(),
      style: {
        backgroundColor: '#F89406',
        color: 'white',
        padding: '10px',
      },
    });
  }
}
