import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit{


    error!:ErrorInterface;
    user:string = "";
    empresa?:EmpresaInterface;
    estacion?:EstacionInterface;

  constructor(
    private _location: Location
  ) {
    
  }
  ngOnInit(): void {
    this.error = PreferencesService.error;
    this.user = PreferencesService.user;
    //TODO: SI no hay usuario traducir texto

    try {
      this.empresa = PreferencesService.empresa;
      this.estacion = PreferencesService.estacion;
    } catch (error) {
      
    }
  }

  //regresar a la pantalla anterior
  goBack() {
    this._location.back();
  }

}
