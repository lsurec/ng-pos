import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRestaurantComponent } from './image-restaurant.component';

describe('ImageRestaurantComponent', () => {
  let component: ImageRestaurantComponent;
  let fixture: ComponentFixture<ImageRestaurantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageRestaurantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
