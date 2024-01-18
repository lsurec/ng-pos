import { TestBed } from '@angular/core/testing';

import { ApiGuard } from './api.guard';

describe('ApiGuard', () => {
  let guard: ApiGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ApiGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
