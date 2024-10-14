import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveRestaurantComponent } from './move-restaurant.component';

describe('MoveRestaurantComponent', () => {
  let component: MoveRestaurantComponent;
  let fixture: ComponentFixture<MoveRestaurantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveRestaurantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
