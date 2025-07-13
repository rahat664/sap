import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { vehicleTrackingResolver } from './vehicle-tracking.resolver';

describe('vehicleTrackingResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => vehicleTrackingResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
