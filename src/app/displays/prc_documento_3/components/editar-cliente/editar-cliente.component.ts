import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { Location } from '@angular/common';
import { EventService } from 'src/app/services/event.service';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { NotificationsService } from 'src/app/services/notifications.service';


@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss']
})
export class EditarClienteComponent {
  @Input() cuenta?: ClienteInterface; // decorate the property with @Input()

  cliente?: ClienteInterface;

  nombre?: string;
  direccion?: string;
  nit?: number;
  telefono?: number;
  correo?: string;

  isLoading: boolean = false;

  constructor(
    private _location: Location,
    private _widgetsService: NotificationsService,
    private translate: TranslateService,
    private _router: Router,
    private _eventService: EventService,

  ) {
    // this.cliente = {
    //   nombre: this.cuenta!.nombre,
    //   direccion: this.cuenta!.direccion,
    //   nit: this.cuenta!.nit,
    //   telefono: this.cuenta!.telefono,
    //   correo: this.cuenta!.correo,
    // }
  }

  ngOnInit() {

  }
  //regresar a la pantalla anterior
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  guardar() {
    console.log(this.cuenta);
    if (!this.nombre || !this.direccion || !this.nit || !this.telefono || !this.correo) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.completar'));
      return
    } else {
      // this._router.navigate([RouteNamesService.DOC]);
    }
  }

}
