import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemaAplicacionComponent } from './tema-aplicacion.component';

describe('TemaAplicacionComponent', () => {
  let component: TemaAplicacionComponent;
  let fixture: ComponentFixture<TemaAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemaAplicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemaAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
