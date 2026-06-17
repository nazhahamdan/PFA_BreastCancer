import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mammography } from './mammography';

describe('Mammography', () => {
  let component: Mammography;
  let fixture: ComponentFixture<Mammography>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mammography]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mammography);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
