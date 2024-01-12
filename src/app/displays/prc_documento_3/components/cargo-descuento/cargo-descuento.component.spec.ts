import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoDescuentoComponent } from './cargo-descuento.component';

describe('CargoDescuentoComponent', () => {
  let component: CargoDescuentoComponent;
  let fixture: ComponentFixture<CargoDescuentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargoDescuentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargoDescuentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
