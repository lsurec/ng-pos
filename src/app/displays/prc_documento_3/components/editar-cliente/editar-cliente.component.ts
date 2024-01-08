import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { Location } from '@angular/common';
import { EventService } from 'src/app/services/event.service';


@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss']
})
export class EditarClienteComponent {
  @Input() item!: string ; // decorate the property with @Input()

  nombre!: string;
  direccion!: string;
  nit!: number;
  telefono!: number;
  correo!: string;

  constructor(
    private _location: Location,
    private _widgetsService: WidgetsService,
    private translate: TranslateService,
    private _router: Router,
    private _eventService: EventService,

  ) {
  }

  //regresar a la pantalla anterior
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  guardar() {
    if (!this.nombre || !this.direccion || !this.nit || !this.telefono || !this.correo) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.completar'));
      return
    } else {
      // this._router.navigate([RouteNamesService.DOC]);
    }
  }

}
