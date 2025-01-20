import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { truckResolver } from './truck.resolver';

describe('truckResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => truckResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
