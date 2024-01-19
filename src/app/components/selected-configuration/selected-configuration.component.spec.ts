import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedConfigurationComponent } from './selected-configuration.component';

describe('SelectedConfigurationComponent', () => {
  let component: SelectedConfigurationComponent;
  let fixture: ComponentFixture<SelectedConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
