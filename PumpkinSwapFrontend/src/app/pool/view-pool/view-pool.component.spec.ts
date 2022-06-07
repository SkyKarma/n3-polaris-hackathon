import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPoolComponent } from './view-pool.component';

describe('ViewPoolComponent', () => {
  let component: ViewPoolComponent;
  let fixture: ComponentFixture<ViewPoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPoolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
