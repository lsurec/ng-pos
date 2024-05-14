import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { loadStepInterface } from 'src/app/interfaces/language.interface';

@Component({
  selector: 'app-pasos',
  templateUrl: './pasos.component.html',
  styleUrls: ['./pasos.component.scss']
})
export class PasosComponent implements OnInit {

  modoBarra: ProgressBarMode = "determinate";
  completado: boolean = false;
  pasosCompletos: number = 0;
  timer: any; //temporizador

  botones: boolean = false;

  pasos: loadStepInterface[] = [
    {
      value: "1: Creando documento.",
      status: 1,
      visible: true,
      progress: "determinate",
    },
    {
      value: "2.Generando firma electronica.",
      status: 1,
      visible: true,
      progress: "determinate",
    }
  ]

  constructor() {
  }

  ngOnInit(): void {

  }

  verBotones() {
    this.botones = !this.botones;
  }

  sinFirma() {

    this.pasos.forEach(element => {
      element.progress = "indeterminate"; //asiganer valorcorrecto
      element.visible = true; //mostrar barras
    });

    this.timer = setTimeout(() => {

      this.pasos.forEach(element => {
        element.progress = "determinate"; //asiganer valorcorrecto
        element.visible = false; //ocultar barras
      });
      this.pasos[0].status = 2; //correcto
      this.pasos[1].status = 3; //fallo

      if (this.pasos[0].status == 2 && this.pasos[1].status == 3) {
        this.pasosCompletos = 1;
      }

    }, 3000);
    this.completado = false;
  }

  losStatus() {
    console.log(this.pasos[0].status);
    console.log(this.pasos[1].status);
  }

  sinDocumento() {
    this.pasos.forEach(element => {
      element.progress = "indeterminate"; //asiganer valorcorrecto
      element.visible = true; //mostrar barras
    });

    this.timer = setTimeout(() => {

      this.pasos.forEach(element => {
        element.progress = "determinate"; //asiganer valorcorrecto
        element.visible = false; //ocultar barras

      });
      this.pasos[0].status = 3; //incorrecto

      //si falló el pasó uno no procede al paso dos
      if (this.pasos[0].status == 3) {
        this.pasos[1].status = 3; //fallo
        this.pasosCompletos = 1;
      }

    }, 3000);
    this.completado = false;
  }

  correcto() {
    this.pasos.forEach(element => {
      element.progress = "indeterminate"; //asiganer valorcorrecto
      element.visible = true; //mostrar barras

    });

    this.timer = setTimeout(() => {

      this.pasos.forEach(element => {
        element.progress = "determinate"; //asiganer valorcorrecto
        element.visible = false; //ocultar barras
      });
      this.pasos[0].status = 2; //correcto
      this.pasos[1].status = 2; //correcto

      this.completado = true;

      if (this.completado) {
        this.pasosCompletos = 2;
      }

    }, 3000);
  }

  reestablecer() {
    //todos los pasos en cargando
    this.pasos.forEach(element => {
      element.status = 1;
      element.visible = true; //mostrar barras
    })
    this.completado = false;
    this.pasosCompletos = 0;
  }
}
