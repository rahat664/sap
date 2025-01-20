import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { transporterResolver } from './transporter.resolver';

describe('transporterResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      transporterResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
