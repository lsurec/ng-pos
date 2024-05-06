import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeProductosComponent } from './informe-productos.component';

describe('InformeProductosComponent', () => {
  let component: InformeProductosComponent;
  let fixture: ComponentFixture<InformeProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformeProductosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformeProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
