import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-registro-de-errores',
  templateUrl: './registro-de-errores.component.html',
  styleUrls: ['./registro-de-errores.component.scss']
})
export class RegistroDeErroresComponent {


  //abirir y cerrar el mat expander
  desplegarCarDes: boolean = false;

  //Abrir/Cerrar SideNav
  // @ViewChild('sidenav')
  // sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;


  constructor(
    private _eventService: EventService,
  ) {
  }



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
