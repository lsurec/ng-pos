import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTareaComponent } from './dialog-tarea.component';

describe('DialogTareaComponent', () => {
  let component: DialogTareaComponent;
  let fixture: ComponentFixture<DialogTareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTareaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogTareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
