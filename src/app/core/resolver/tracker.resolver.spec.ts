import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { trackerResolver } from './tracker.resolver';

describe('trackerResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => trackerResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
