import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraducirComponent } from './traducir.component';

describe('TraducirComponent', () => {
  let component: TraducirComponent;
  let fixture: ComponentFixture<TraducirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraducirComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraducirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
