import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { loadStepInterface } from 'src/app/interfaces/language.interface';

@Component({
  selector: 'app-pasos',
  templateUrl: './pasos.component.html',
  styleUrls: ['./pasos.component.scss']
})
export class PasosComponent {



  constructor(
    public facturaService: FacturaService,
  ) {
  }



  verInformeError() {
    this.facturaService.verError = true;
  }


  backPage() {
    this.facturaService.isStepLoading = false;
  }
}
