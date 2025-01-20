import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { challanDataResolver } from './challan-data.resolver';

describe('challanDataResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      challanDataResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
