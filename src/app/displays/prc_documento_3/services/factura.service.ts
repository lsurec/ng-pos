// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacturaService {
  private loadData = new Subject<void>();

  loadData$ = this.loadData.asObservable();

  loadDataSet() {
    this.loadData.next();
  }

}
