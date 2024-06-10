import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsSinConfirmarComponent } from './docs-sin-confirmar.component';

describe('DocsSinConfirmarComponent', () => {
  let component: DocsSinConfirmarComponent;
  let fixture: ComponentFixture<DocsSinConfirmarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocsSinConfirmarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocsSinConfirmarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
