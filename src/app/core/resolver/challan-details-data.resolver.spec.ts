import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { challanDetailsDataResolver } from './challan-details-data.resolver';

describe('challanDetailsDataResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      challanDetailsDataResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
