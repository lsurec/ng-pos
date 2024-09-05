import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTerminosComponent } from './editar-terminos.component';

describe('EditarTerminosComponent', () => {
  let component: EditarTerminosComponent;
  let fixture: ComponentFixture<EditarTerminosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTerminosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTerminosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
