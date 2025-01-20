import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { driverResolver } from './driver.resolver';

describe('driverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => driverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
