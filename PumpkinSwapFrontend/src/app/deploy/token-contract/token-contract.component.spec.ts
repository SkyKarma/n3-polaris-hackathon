import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenContractComponent } from './token-contract.component';

describe('TokenContractComponent', () => {
  let component: TokenContractComponent;
  let fixture: ComponentFixture<TokenContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenContractComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
