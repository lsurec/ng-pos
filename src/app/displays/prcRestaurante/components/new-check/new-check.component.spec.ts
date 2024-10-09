import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCheckComponent } from './new-check.component';

describe('NewCheckComponent', () => {
  let component: NewCheckComponent;
  let fixture: ComponentFixture<NewCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
