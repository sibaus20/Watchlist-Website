import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WantWatchPageComponent } from './want-watch-page.component';

describe('WantWatchPageComponent', () => {
  let component: WantWatchPageComponent;
  let fixture: ComponentFixture<WantWatchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WantWatchPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WantWatchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
