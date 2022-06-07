import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotTrustedDialogComponent } from './not-trusted-dialog.component';

describe('NotTrustedDialogComponent', () => {
  let component: NotTrustedDialogComponent;
  let fixture: ComponentFixture<NotTrustedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotTrustedDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotTrustedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
