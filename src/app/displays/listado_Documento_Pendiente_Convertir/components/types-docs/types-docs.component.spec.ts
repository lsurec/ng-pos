import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesDocsComponent } from './types-docs.component';

describe('TypesDocsComponent', () => {
  let component: TypesDocsComponent;
  let fixture: ComponentFixture<TypesDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypesDocsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
