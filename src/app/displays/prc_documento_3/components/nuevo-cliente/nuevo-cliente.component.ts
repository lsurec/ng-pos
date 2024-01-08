import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss']
})
export class NuevoClienteComponent {

  nombre!: string;
  direccion!: string;
  nit!: number;
  telefono!: number;
  correo!: string;

  constructor(
    private _location: Location,
    private _widgetsService: NotificationsService,
    private translate: TranslateService,
    private _router: Router,

  ) {
  }

  //regresar a la pantalla anterior
  goBack() {
    this._location.back();
  }

  guardar() {
    if (!this.nombre || !this.direccion || !this.nit || !this.telefono || !this.correo) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.completar'));
      return
    } else {
      this._router.navigate([RouteNamesService.DOC]);
    }
  }

}
