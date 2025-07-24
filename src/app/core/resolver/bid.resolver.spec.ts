import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { bidResolver } from './bid.resolver';

describe('bidResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => bidResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
