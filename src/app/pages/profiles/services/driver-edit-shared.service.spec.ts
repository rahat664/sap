import { TestBed } from '@angular/core/testing';

import { DriverEditSharedService } from './driver-edit-shared.service';

describe('DriverEditSharedService', () => {
  let service: DriverEditSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverEditSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
