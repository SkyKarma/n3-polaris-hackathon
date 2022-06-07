import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityEarningsComponent } from './liquidity-earnings.component';

describe('LiquidityEarningsComponent', () => {
  let component: LiquidityEarningsComponent;
  let fixture: ComponentFixture<LiquidityEarningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidityEarningsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityEarningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
