// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RetryService {
  private splash = new Subject<void>();

  splash$ = this.splash.asObservable();

  splashRetry() {
    this.splash.next();
  }

  private config = new Subject<void>();

  config$ = this.config.asObservable();

  configRetry() {
    this.config.next();
  }


  private home = new Subject<void>();

  home$ = this.home.asObservable();

  homeRetry() {
    this.home.next();
  }
}
