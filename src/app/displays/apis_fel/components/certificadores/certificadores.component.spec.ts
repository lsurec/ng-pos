import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificadoresComponent } from './certificadores.component';

describe('CertificadoresComponent', () => {
  let component: CertificadoresComponent;
  let fixture: ComponentFixture<CertificadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificadoresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
