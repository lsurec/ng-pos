import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { PostDocumentInterface } from '../../interfaces/post-document.interface';
import { DocumentService } from '../../services/document.service';
import { CargoAbono, Documento, Transaccion } from '../../interfaces/doc-estructura.interface';
import { TranslateService } from '@ngx-translate/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

@Component({
  selector: 'app-resumen-documento',
  templateUrl: './resumen-documento.component.html',
  styleUrls: ['./resumen-documento.component.scss'],
  providers: [
    DocumentService,
  ]
})
export class ResumenDocumentoComponent {

  isLoading: boolean = false;
  regresar: number = 4;
  verError: boolean = false;

  observacion = "";

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;
  serie: string = this.facturaService.serie!.serie_Documento;
  tipoCambio: number = PreferencesService.tipoCambio;


  consecutivo: number = 0;

  constructor(
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _documentService: DocumentService,
    private _translate: TranslateService,

  ) {

    this._eventService.regresarResumen$.subscribe((eventData) => {
      this.verError = false;
    });
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }


  mostrarError(res:ResApiInterface) {
    
    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    PreferencesService.error = error;
    this.verError = true;
  }

  sendDoc() {
    if (this.facturaService.printFel()) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.certificacionNoDisponible'));
    } else {
      this.sendDocument()
    }

  }

  async sendDocument() {

    let pagos: CargoAbono[] = [];
    let transacciones: Transaccion[] = [];

    //id transaccion
    let consecutivo: number = 1;

    //recorre transacciones
    this.facturaService.traInternas.forEach(transaccion => {

      //id padre
      let padre: number = consecutivo;

      //cargos
      let cargos: Transaccion[] = [];

      //descuentos
      let descuentos: Transaccion[] = [];

      //buscar cargos y descuentos
      transaccion.operaciones.forEach(operacion => {
        //agregar cargo
        if (operacion.cargo > 0) {
          //aumentar id
          consecutivo++;


          //agregar cargos
          cargos.push(
            {
              Tra_Consecutivo_Interno: consecutivo,
              Tra_Consecutivo_Interno_Padre: padre,
              Tra_Bodega: transaccion.bodega!.bodega,
              Tra_Producto: transaccion.producto.producto,
              Tra_Unidad_Medida: transaccion.producto.unidad_Medida,
              Tra_Cantidad: 0,
              Tra_Tipo_Cambio: this.tipoCambio,
              Tra_Moneda: transaccion.precio!.moneda,
              Tra_Tipo_Precio: transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Factor_Conversion: !transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Tipo_Transaccion: this.facturaService.resolveTipoTransaccion(4),
              Tra_Monto: operacion.cargo,
            }
          );

        }

        //Agregar descuentos
        if (operacion.descuento < 0) {
          consecutivo++;
          descuentos.push(
            {
              Tra_Consecutivo_Interno: consecutivo,
              Tra_Consecutivo_Interno_Padre: padre,
              Tra_Bodega: transaccion.bodega!.bodega,
              Tra_Producto: transaccion.producto.producto,
              Tra_Unidad_Medida: transaccion.producto.unidad_Medida,
              Tra_Cantidad: 0,
              Tra_Tipo_Cambio: this.tipoCambio,
              Tra_Moneda: transaccion.precio!.moneda,
              Tra_Tipo_Precio: transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Factor_Conversion: !transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Tipo_Transaccion: this.facturaService.resolveTipoTransaccion(3),
              Tra_Monto: operacion.cargo,
            }
          );
        }

      });


      transacciones.push(
        {
          Tra_Consecutivo_Interno: padre,
          Tra_Consecutivo_Interno_Padre: null,
          Tra_Bodega: transaccion.bodega!.bodega,
          Tra_Producto: transaccion.producto.producto,
          Tra_Unidad_Medida: transaccion.producto.unidad_Medida,
          Tra_Cantidad: transaccion.cantidad,
          Tra_Tipo_Cambio: this.tipoCambio,
          Tra_Moneda: transaccion.precio!.moneda,
          Tra_Tipo_Precio: transaccion.precio!.precio ? transaccion.precio!.id : null,
          Tra_Factor_Conversion: !transaccion.precio!.precio ? transaccion.precio!.id : null,
          Tra_Tipo_Transaccion: this.facturaService.resolveTipoTransaccion(transaccion.producto.tipo_Producto),
          Tra_Monto: transaccion.cantidad * transaccion.precio!.precioU,
        }

      );


      cargos.forEach(cargo => {
        transacciones.push(cargo);
      });


      descuentos.forEach(descuento => {
        transacciones.push(descuento);
      });

      consecutivo++;

    });

    this.facturaService.montos.forEach(monto => {
      pagos.push(
        {
          Tipo_Cargo_Abono: monto.payment.tipo_Cargo_Abono,
          Monto: monto.amount,
          Cambio: monto.difference,
          Tipo_Cambio: this.tipoCambio,
          Moneda: transacciones[0].Tra_Moneda,
          Monto_Moneda: monto.amount / this.tipoCambio,
          Referencia: monto.reference,
          Autorizacion: monto.authorization,
          Banco: monto.bank?.banco ?? null,
          Cuenta_Bancaria: monto.account?.cuenta_Bancaria ?? null,
        }
      );
    });


    // Generar dos números aleatorios de 7 dígitos cada uno?
    let randomNumber1: number = Math.floor(Math.random() * 9000000) + 1000000;
    let randomNumber2: number = Math.floor(Math.random() * 9000000) + 1000000;

    // Combinar los dos números para formar uno de 14 dígitos
    let strNum1: string = randomNumber1.toString();
    let strNum2: string = randomNumber2.toString();
    let combinedStr: string = strNum1 + strNum2;
    let combinedNum: number = parseInt(combinedStr, 10);

    let totalCA: number = 0;

    this.facturaService.montos.forEach(monto => {
      totalCA += monto.amount;
    });


    //Obtener fecha y hora actual
    let currentDate: Date = new Date();

    let doc: Documento = {

      Doc_Tra_Monto: this.facturaService.total,
      Doc_CA_Monto: totalCA,
      Doc_ID_Certificador: 1, //TODO:Parametrizar
      Doc_Cuenta_Correntista_Ref: this.facturaService.vendedor?.cuenta_Correntista ?? null,
      Doc_ID_Documento_Ref: combinedNum,
      Doc_FEL_numeroDocumento: null,
      Doc_FEL_Serie: null,
      Doc_FEL_UUID: null,
      Doc_FEL_fechaCertificacion: null,
      Doc_Fecha_Documento: currentDate.toISOString(),
      Doc_Cuenta_Correntista: this.facturaService.cuenta!.cuenta_Correntista,
      Doc_Cuenta_Cta: this.facturaService.cuenta!.cuenta_Cta,
      Doc_Tipo_Documento: this.documento,
      Doc_Serie_Documento: this.serie,
      Doc_Empresa: this.empresa,
      Doc_Estacion_Trabajo: this.estacion,
      Doc_UserName: this.user,
      Doc_Observacion_1: this.observacion,
      Doc_Tipo_Pago: 1, //TODO:preguntar
      Doc_Elemento_Asignado: 1, //TODO:Preguntar
      Doc_Transaccion: transacciones,
      Doc_Cargo_Abono: pagos,
    }

    let document: PostDocumentInterface = {
      estructura: JSON.stringify(doc),
      user: this.user,
    }

    this.isLoading = true;
    let resDoc = await this._documentService.postDocument(this.token, document);
    this.isLoading = false;

    if (!resDoc.status) {
      this.mostrarError(resDoc);
      return;
    }

    this._notificationService.openSnackbar(this._translate.instant('pos.alertas.documentoCreado'));
  }

}
