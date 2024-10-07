// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

//eventos para pantalla volver a cargar
export class LoadRestaurantService {

  ///volver a cargar en la pantlla classifications
  private classifications = new Subject<void>();

  classifications$ = this.classifications.asObservable();

  loadClassifications() {
    this.classifications.next();
  }


}