import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenDocumentoComponent } from './resumen-documento.component';

describe('ResumenDocumentoComponent', () => {
  let component: ResumenDocumentoComponent;
  let fixture: ComponentFixture<ResumenDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumenDocumentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
