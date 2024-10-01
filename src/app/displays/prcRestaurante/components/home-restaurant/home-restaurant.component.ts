import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RestaurantService } from '../../services/global-restaurat.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { SerieInterface } from 'src/app/displays/prc_documento_3/interfaces/serie.interface';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';

@Component({
  selector: 'app-home-restaurant',
  templateUrl: './home-restaurant.component.html',
  styleUrls: ['./home-restaurant.component.scss']
})
export class HomeRestaurantComponent {


  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  readonly regresar: number = 1; //id de la pnatalla

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion

  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento?: number = 1; //tipo docuemnto seleccionado
  nombreDocumento: string = "1 ejemplo"; //Descripcion del tipo de documento
  documentoName: string = ""; //Descripcion tipo de documento
  series: SerieInterface[] = [] //Series disponibles para un odcumento
  serie?: SerieInterface; //Serie seleccionada


  constructor(
    private notificationService: NotificationsService,
    public restaurantService: RestaurantService,
    public dataUserService: DataUserService,

  ) {
  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  goBack() { }

  loadData() { }

  sendDoc() { }

  verHistorial() { }

  newDoc() { }

  printDoc() { }




}
