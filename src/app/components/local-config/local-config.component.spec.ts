import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalConfigComponent } from './local-config.component';

describe('LocalConfigComponent', () => {
  let component: LocalConfigComponent;
  let fixture: ComponentFixture<LocalConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
