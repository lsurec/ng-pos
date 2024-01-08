import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent {

  @Output() newItemEvent = new EventEmitter<boolean>();

  serie!: string;
  series: string[] = [
    "FAC M",
    "FAC MX",
    "FAC GT"
  ]
  vendedor!: string;
  vendedores: string[] = [
    "Proveedor",
    "Vendedor 01",
    "DEMOSOFT"
  ]
  switchState: boolean = false;

  constructor(
    private router: Router,
    private _widgetService: NotificationsService,
    private _location: Location,
    private _eventService: EventService,
  ) {

  }

  // Función para manejar el cambio de estado del switch
  toggleSwitch(): void {
    this.switchState = !this.switchState;
  }

  documento: boolean = false;
  detalle: boolean = true;
  pago: boolean = false;

  vistaDocumento() {
    this.documento = true;
    this.detalle = false;
    this.pago = false;
  }

  vistaDetalle() {
    this.detalle = true;
    this.documento = false;
    this.pago = false;
  }

  vistaPago() {
    this.pago = true;
    this.detalle = false;
    this.documento = false;
  }

  searchText!: string;
  selectedOption: number | null = 1;


  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "SKU",
    },
    {
      id: 2,
      nombre: "Descripción",
    },
  ];

  buscarProducto() {

  }

  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }

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

  // //regresar a la pantalla anterior.
  // goBack(): void {
  //   this.newItemEvent.emit(true);
  // }

  goBack(): void {
    // this.newItemEvent.emit(false);
    this._eventService.emitCustomEvent(false);
  }
}
