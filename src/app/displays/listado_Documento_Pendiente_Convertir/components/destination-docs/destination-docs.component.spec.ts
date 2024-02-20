import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationDocsComponent } from './destination-docs.component';

describe('DestinationDocsComponent', () => {
  let component: DestinationDocsComponent;
  let fixture: ComponentFixture<DestinationDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DestinationDocsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
