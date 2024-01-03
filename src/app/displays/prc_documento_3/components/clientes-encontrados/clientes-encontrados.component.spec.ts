import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesEncontradosComponent } from './clientes-encontrados.component';

describe('ClientesEncontradosComponent', () => {
  let component: ClientesEncontradosComponent;
  let fixture: ComponentFixture<ClientesEncontradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientesEncontradosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesEncontradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
