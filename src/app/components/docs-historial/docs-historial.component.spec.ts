import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsHistorialComponent } from './docs-historial.component';

describe('DocsHistorialComponent', () => {
  let component: DocsHistorialComponent;
  let fixture: ComponentFixture<DocsHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocsHistorialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocsHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
