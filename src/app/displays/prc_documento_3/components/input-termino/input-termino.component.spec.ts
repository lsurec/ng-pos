import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTerminoComponent } from './input-termino.component';

describe('InputTerminoComponent', () => {
  let component: InputTerminoComponent;
  let fixture: ComponentFixture<InputTerminoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputTerminoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTerminoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
