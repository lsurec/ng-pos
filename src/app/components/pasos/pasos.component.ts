import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { loadStepInterface } from 'src/app/interfaces/language.interface';
import { RetryService } from 'src/app/services/retry.service';

@Component({
  selector: 'app-pasos',
  templateUrl: './pasos.component.html',
  styleUrls: ['./pasos.component.scss']
})
export class PasosComponent {

  constructor(
    public facturaService: FacturaService,
    private _retryService: RetryService,

  ) {
  }


  pintFormat(){
    this.facturaService.isStepLoading = false;
    this._retryService.printFormatRetry();
  }

  reloadDoc(){
    this._retryService.createDocRetry();

  }

  reloadFel(){
    this._retryService.felProcessRetry();
  }

  verInformeError() {
    console.log("aqui");
    
    this.facturaService.verError = true;
    this.facturaService.isStepLoading = false;
  }

  backPage() {
    this.facturaService.isStepLoading = false;
  }
}
