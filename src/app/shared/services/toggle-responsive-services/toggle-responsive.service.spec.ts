import { TestBed } from '@angular/core/testing';

import { ToggleResponsiveService } from './toggle-responsive.service';

describe('ToggleResponsiveService', () => {
  let service: ToggleResponsiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleResponsiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
