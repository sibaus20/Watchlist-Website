import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlreadyWatchedPageComponent } from './already-watched-page.component';

describe('AlreadyWatchedPageComponent', () => {
  let component: AlreadyWatchedPageComponent;
  let fixture: ComponentFixture<AlreadyWatchedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlreadyWatchedPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlreadyWatchedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
