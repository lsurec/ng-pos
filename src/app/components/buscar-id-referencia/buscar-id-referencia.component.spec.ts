import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarIdReferenciaComponent } from './buscar-id-referencia.component';

describe('BuscarIdReferenciaComponent', () => {
  let component: BuscarIdReferenciaComponent;
  let fixture: ComponentFixture<BuscarIdReferenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarIdReferenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarIdReferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
