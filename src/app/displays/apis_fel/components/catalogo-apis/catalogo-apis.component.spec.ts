import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoApisComponent } from './catalogo-apis.component';

describe('CatalogoApisComponent', () => {
  let component: CatalogoApisComponent;
  let fixture: ComponentFixture<CatalogoApisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogoApisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoApisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
