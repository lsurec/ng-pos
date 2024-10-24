// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

//eventos para pantalla volver a cargar
export class RetryService {

  ///volver a cargar en la pantlla splash
  private splash = new Subject<void>();

  splash$ = this.splash.asObservable();

  splashRetry() {
    this.splash.next();
  }

  //Volver a cargar desde configuracion local
  private config = new Subject<void>();

  config$ = this.config.asObservable();

  configRetry() {
    this.config.next();
  }


  //volver a cargar el home
  private home = new Subject<void>();

  home$ = this.home.asObservable();

  homeRetry() {
    this.home.next();
  }



  ///volver a cargar proceso
  private createDoc = new Subject<void>();

  createDoc$ = this.createDoc.asObservable();

  createDocRetry() {
    this.createDoc.next();
  }


  ///volver a cargar firma electroncia
  private felProcess = new Subject<void>();

  felProcess$ = this.felProcess.asObservable();

  felProcessRetry() {
    this.felProcess.next();
  }


  private printFormat = new Subject<void>();

  printFormat$ = this.printFormat.asObservable();

  printFormatRetry() {
    this.printFormat.next();
  }

  //para productos de una clasificacion
  private products = new Subject<void>();

  products$ = this.products.asObservable();

  productsRetry() {
    this.products.next();
  }
}
