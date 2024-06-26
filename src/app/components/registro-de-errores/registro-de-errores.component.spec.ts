import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroDeErroresComponent } from './registro-de-errores.component';

describe('RegistroDeErroresComponent', () => {
  let component: RegistroDeErroresComponent;
  let fixture: ComponentFixture<RegistroDeErroresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroDeErroresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroDeErroresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
