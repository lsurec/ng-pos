import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarDocComponent } from './recuperar-doc.component';

describe('RecuperarDocComponent', () => {
  let component: RecuperarDocComponent;
  let fixture: ComponentFixture<RecuperarDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecuperarDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
