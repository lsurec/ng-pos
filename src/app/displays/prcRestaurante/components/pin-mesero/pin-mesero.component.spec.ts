import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinMeseroComponent } from './pin-mesero.component';

describe('PinMeseroComponent', () => {
  let component: PinMeseroComponent;
  let fixture: ComponentFixture<PinMeseroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PinMeseroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinMeseroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
