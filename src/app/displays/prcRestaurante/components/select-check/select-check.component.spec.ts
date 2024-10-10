import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCheckComponent } from './select-check.component';

describe('SelectCheckComponent', () => {
  let component: SelectCheckComponent;
  let fixture: ComponentFixture<SelectCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
