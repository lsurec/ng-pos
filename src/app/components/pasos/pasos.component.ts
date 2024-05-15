import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { loadStepInterface } from 'src/app/interfaces/language.interface';

@Component({
  selector: 'app-pasos',
  templateUrl: './pasos.component.html',
  styleUrls: ['./pasos.component.scss']
})
export class PasosComponent implements OnInit {

  modoBarra: ProgressBarMode = "indeterminate";
  completado: boolean = false;
  pasosCompletos: number = 0;
  timer: any; //temporizador

  botones: boolean = false;

  pasos: loadStepInterface[] = [
    {
      value: "1: Creando documento.",
      status: 1,
      visible: true,
    },
    {
      value: "2.Generando firma electronica.",
      status: 1,
      visible: true,
    }
  ]

  constructor(
    public facturaService: FacturaService,
  ) {
  }

  ngOnInit(): void {

  }

  verInformeError() {
    this.facturaService.verError = true;
  }

  verBotones() {
    this.botones = !this.botones;
  }


  losStatus() {
    console.log(this.pasos[0].status);
    console.log(this.pasos[1].status);
  }



  backPage() {
    this.facturaService.isStepLoading = false;
  }
}
