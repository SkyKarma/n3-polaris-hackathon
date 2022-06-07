import { TestBed } from '@angular/core/testing';

import { NeolineService } from './neoline.service';

describe('NeolineService', () => {
  let service: NeolineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NeolineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
