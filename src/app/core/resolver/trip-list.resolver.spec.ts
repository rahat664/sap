import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { tripListResolver } from './trip-list.resolver';

describe('tripListResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      tripListResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
