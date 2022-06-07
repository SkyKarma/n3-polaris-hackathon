import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenSelectDialogComponent } from './token-select-dialog.component';

describe('TokenSelectDialogComponent', () => {
  let component: TokenSelectDialogComponent;
  let fixture: ComponentFixture<TokenSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
