import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ErrorService } from 'src/app/services/error.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-registro-de-errores',
  templateUrl: './registro-de-errores.component.html',
  styleUrls: ['./registro-de-errores.component.scss'],
  providers: [
    ErrorService,
  ]
})
export class RegistroDeErroresComponent implements OnInit {

  isLoading: boolean = false;
  token: string = PreferencesService.token;


  constructor(
    private _errorService: ErrorService,
    private _eventService: EventService,

  ) {

  }


  ngOnInit(): void {
    this.laodData();
  }

  async laodData() {
    this.isLoading = true;


    let resApi: ResApiInterface = await this._errorService.getError(this.token);

    console.log(resApi);



    this.isLoading = false;
  }





  //abirir y cerrar el mat expander
  desplegarCarDes: boolean = false;

  //Abrir/Cerrar SideNav
  // @ViewChild('sidenav')
  // sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;


  //Abrir cerrar Sidenav
  close(reason: string) {
    // this.sidenav.close();
    this.sidenavend.close();
  }



  loadData() {

  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    this._eventService.verHomeEvent(false);
  }



}
