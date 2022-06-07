import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockLiquidityComponent } from './lock-liquidity.component';

describe('LockLiquidityComponent', () => {
  let component: LockLiquidityComponent;
  let fixture: ComponentFixture<LockLiquidityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockLiquidityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockLiquidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
