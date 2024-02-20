import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginDocsComponent } from './origin-docs.component';

describe('OriginDocsComponent', () => {
  let component: OriginDocsComponent;
  let fixture: ComponentFixture<OriginDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OriginDocsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OriginDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
