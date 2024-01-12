import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DocCargoAbono, DocTransaccion } from '../../interfaces/doc-estructura.interface';

@Component({
  selector: 'app-resumen-documento',
  templateUrl: './resumen-documento.component.html',
  styleUrls: ['./resumen-documento.component.scss']
})
export class ResumenDocumentoComponent {

  isLoading: boolean = false;

  observacion = "";

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;
  serie: string = this.facturaService.serie!.serie_Documento;

  constructor(
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _notificationService: NotificationsService,
  ) {
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  sendDoc() {
    if (this.facturaService.printFel()) {
      this.sendDocument()
    } else {
      this._notificationService.openSnackbar("La certificacion de docuentos tributarios electronicos no está disponible en este momento.");
    }

  }

  sendDocument() {

    let pagos: DocCargoAbono[] = [];
    let transacciones: DocTransaccion[] = [];

    //id transaccion
    let consecutivo: number = 1;

    //recorre transacciones
    this.facturaService.traInternas.forEach(transaccion => {

      //id padre
      let padre: number = consecutivo;

      //cargos
      let cargos: DocTransaccion[] = [];

      //descuentos
      let descuentos: DocTransaccion[] = [];

      //buscar cargos y descuentos
      transaccion.operaciones.forEach(operacion => {
        //agregar cargo
        if (operacion.cargo > 0) {
          //aumentar id
          consecutivo++;

          // //agregar cargos
          // cargos.push(
          //   {
          //     traConsecutivoInterno: consecutivo,
          //     traConsecutivoInternoPadre:padre,
          //     traBodega: transaccion.bodega!.bodega,
          //     traProducto: transaccion.producto.producto,
          //     traUnidadMedida: transaccion.producto.unidad_Medida,
          //     traCantidad:0,
          //     traTipoCambio:
          //   }
          // );
        }
      });



    });


  }

}
