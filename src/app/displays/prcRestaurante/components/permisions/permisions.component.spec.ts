import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisionsComponent } from './permisions.component';

describe('PermisionsComponent', () => {
  let component: PermisionsComponent;
  let fixture: ComponentFixture<PermisionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermisionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
