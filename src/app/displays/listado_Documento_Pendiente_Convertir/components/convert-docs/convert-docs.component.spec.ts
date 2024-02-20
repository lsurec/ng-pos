import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertDocsComponent } from './convert-docs.component';

describe('ConvertDocsComponent', () => {
  let component: ConvertDocsComponent;
  let fixture: ComponentFixture<ConvertDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvertDocsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvertDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
