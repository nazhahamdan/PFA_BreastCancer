import { TestBed } from '@angular/core/testing';

import { MammographyService } from './mammography.service';

describe('MammographyService', () => {
  let service: MammographyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MammographyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
