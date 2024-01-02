import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraLogoDemosoftComponent } from './barra-logo-demosoft.component';

describe('BarraLogoDemosoftComponent', () => {
  let component: BarraLogoDemosoftComponent;
  let fixture: ComponentFixture<BarraLogoDemosoftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarraLogoDemosoftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraLogoDemosoftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
