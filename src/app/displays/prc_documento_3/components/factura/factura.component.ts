import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { DataUserService } from '../../services/data-user.service';
import { FacturaService } from '../../services/factura.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent implements OnInit, OnDestroy {

  @Output() newItemEvent = new EventEmitter<boolean>();

  cuenta?: ClienteInterface;

  constructor(
    private router: Router,
    private _widgetService: NotificationsService,
    private _location: Location,
    private _eventService: EventService,
    private _facturaService: FacturaService,
    public dataUserService: DataUserService,
  ) {

    this._eventService.verCrear$.subscribe((eventData) => {
      this.verNuevoCliente();
    });

    this._eventService.verActualizar$.subscribe((eventData) => {
      this.cuenta = eventData;
      this.verActualizarCliente();
    });

    this._eventService.verDocumento$.subscribe((eventData) => {
      this.verDocumento();
    });

    this._eventService.verResumen$.subscribe((eventData) => {
      this.verDocumento();
    });

  }



  vistaFactura: boolean = true;
  nuevoCliente: boolean = false;
  actualizarCliente: boolean = false;
  vistaResumen: boolean = false;

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
    this.vistaResumen = false;
  }

  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;

  }

  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaResumen = false;
  }

  verResumen() {
    this.vistaResumen = true;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
  }
  private ngUnsubscribe = new Subject<void>();


  ngOnInit(): void {
    this._facturaService.loadData$
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.loadData();
      });

    this._facturaService.loadDataSet();
  }

  loadData() {
    console.log("siempre");
  }

  ngOnDestroy(): void {
    console.log("cerrar");
    
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
