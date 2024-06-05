import { TestBed } from '@angular/core/testing';

import { ConvertToFormdataService } from './convert-to-formdata.service';

describe('ConvertToFormdataService', () => {
  let service: ConvertToFormdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertToFormdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
