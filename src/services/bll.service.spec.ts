import { TestBed } from '@angular/core/testing';

import { BllService } from './bll.service';

describe('BllService', () => {
  let service: BllService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BllService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
