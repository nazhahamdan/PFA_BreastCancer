import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticPriliminaire } from './diagnostic-priliminaire';

describe('DiagnosticPriliminaire', () => {
  let component: DiagnosticPriliminaire;
  let fixture: ComponentFixture<DiagnosticPriliminaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticPriliminaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticPriliminaire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
