import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameCheckComponent } from './rename-check.component';

describe('RenameCheckComponent', () => {
  let component: RenameCheckComponent;
  let fixture: ComponentFixture<RenameCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenameCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenameCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
