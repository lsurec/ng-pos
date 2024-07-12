import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterConfigurationComponent } from './printer-configuration.component';

describe('PrinterConfigurationComponent', () => {
  let component: PrinterConfigurationComponent;
  let fixture: ComponentFixture<PrinterConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrinterConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
