import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleErrorComponent } from './detalle-error.component';

describe('DetalleErrorComponent', () => {
  let component: DetalleErrorComponent;
  let fixture: ComponentFixture<DetalleErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
