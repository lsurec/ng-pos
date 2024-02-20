import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeConvertComponent } from './home-convert.component';

describe('HomeConvertComponent', () => {
  let component: HomeConvertComponent;
  let fixture: ComponentFixture<HomeConvertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeConvertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
