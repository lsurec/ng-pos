import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComandaComponent } from './error-comanda.component';

describe('ErrorComandaComponent', () => {
  let component: ErrorComandaComponent;
  let fixture: ComponentFixture<ErrorComandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorComandaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorComandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
