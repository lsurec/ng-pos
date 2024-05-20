import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundItemComponent } from './not-found-item.component';

describe('NotFoundItemComponent', () => {
  let component: NotFoundItemComponent;
  let fixture: ComponentFixture<NotFoundItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotFoundItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
