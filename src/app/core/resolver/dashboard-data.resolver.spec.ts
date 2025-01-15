import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { dashboardDataResolver } from './dashboard-data.resolver';

describe('dashboardDataResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      dashboardDataResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
