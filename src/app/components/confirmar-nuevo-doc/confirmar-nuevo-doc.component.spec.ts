import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarNuevoDocComponent } from './confirmar-nuevo-doc.component';

describe('ConfirmarNuevoDocComponent', () => {
  let component: ConfirmarNuevoDocComponent;
  let fixture: ComponentFixture<ConfirmarNuevoDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmarNuevoDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarNuevoDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
