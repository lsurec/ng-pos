import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosEncontradosComponent } from './productos-encontrados.component';

describe('ProductosEncontradosComponent', () => {
  let component: ProductosEncontradosComponent;
  let fixture: ComponentFixture<ProductosEncontradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductosEncontradosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosEncontradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
