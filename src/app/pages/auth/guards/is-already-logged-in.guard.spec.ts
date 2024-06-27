import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isAlreadyLoggedInGuard } from './is-already-logged-in.guard';

describe('isAlreadyLoggedInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      isAlreadyLoggedInGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
