import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LenguajeAplicacionComponent } from './lenguaje-aplicacion.component';

describe('LenguajeAplicacionComponent', () => {
  let component: LenguajeAplicacionComponent;
  let fixture: ComponentFixture<LenguajeAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LenguajeAplicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LenguajeAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
