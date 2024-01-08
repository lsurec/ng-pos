import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { Router } from '@angular/router';
import { WidgetsService } from 'src/app/services/widgets.service';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';
import { ClienteInterface } from '../../interfaces/cliente.interface';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent {

  @Output() newItemEvent = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private _widgetService: WidgetsService,
    private _location: Location,
    private _eventService: EventService,
  ) {

    this._eventService.verCrear$.subscribe((eventData) => {
      this.verNuevoCliente();
    });

    this._eventService.verActualizar$.subscribe((eventData) => {
      this.verActualizarCliente();
    });

    this._eventService.verDocumento$.subscribe((eventData) => {
      this.verDocumento();
    });

  }



  vistaFactura: boolean = true;

  nuevoCliente: boolean = false;
  actualizarCliente: boolean = false;


  //Abrir/Cerrar SideNav
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  tabAcitve = "document"

  close(reason: string) {
    this.sidenav.close();
    this.sidenavend.close();
  }


  verNuevoCliente() {
    this.nuevoCliente = true;
    this.actualizarCliente = false;
    this.vistaFactura = false;
  }

  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
  }

  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
  }

  ngOnInit(): void {
  }

  //Cerra sesion
  async logOut() {

    let verificador = await this._widgetService.openDialogActions({ title: "Cerrar sesión", description: "Se perderán los datos que no han sido guardados ¿Estás seguro?", verdadero: "", falso: "" });
    if (!verificador) return;

    //Limpiar datos del storage
    localStorage.clear();
    sessionStorage.clear();
    //return to login and delete de navigation route
    this.router.navigate(['/login']);
  }

  goBack(): void {
    // this.newItemEvent.emit(false);
    this._eventService.emitCustomEvent(false);
  }
}
