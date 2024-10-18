import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCheckTransactionComponent } from './move-check-transaction.component';

describe('MoveCheckTransactionComponent', () => {
  let component: MoveCheckTransactionComponent;
  let fixture: ComponentFixture<MoveCheckTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveCheckTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveCheckTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
