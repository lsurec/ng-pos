import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDestDocsComponent } from './details-dest-docs.component';

describe('DetailsDestDocsComponent', () => {
  let component: DetailsDestDocsComponent;
  let fixture: ComponentFixture<DetailsDestDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsDestDocsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsDestDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
