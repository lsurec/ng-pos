import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraLogosComponent } from './barra-logos.component';

describe('BarraLogosComponent', () => {
  let component: BarraLogosComponent;
  let fixture: ComponentFixture<BarraLogosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarraLogosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraLogosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
