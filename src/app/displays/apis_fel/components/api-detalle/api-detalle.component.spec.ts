import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiDetalleComponent } from './api-detalle.component';

describe('ApiDetalleComponent', () => {
  let component: ApiDetalleComponent;
  let fixture: ComponentFixture<ApiDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiDetalleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
