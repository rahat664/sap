import { TestBed } from '@angular/core/testing';

import { HandleToastrService } from './handle-toastr.service';

describe('HandleToastrService', () => {
  let service: HandleToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleToastrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
