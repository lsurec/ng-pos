import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductClassificationsComponent } from './product-classifications.component';

describe('ProductClassificationsComponent', () => {
  let component: ProductClassificationsComponent;
  let fixture: ComponentFixture<ProductClassificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductClassificationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
