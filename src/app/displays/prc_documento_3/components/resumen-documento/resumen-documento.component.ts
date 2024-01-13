import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DocCargoAbono, DocEstructuraInterface, DocTransaccion } from '../../interfaces/doc-estructura.interface';

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
  tipoCambio: number = PreferencesService.tipoCambio;

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

          //agregar cargos
          cargos.push(
            {
              traConsecutivoInterno: consecutivo,
              traConsecutivoInternoPadre: padre,
              traBodega: transaccion.bodega!.bodega,
              traProducto: transaccion.producto.producto,
              traUnidadMedida: transaccion.producto.unidad_Medida,
              traCantidad: 0,
              traTipoCambio: this.tipoCambio,
              traMoneda: transaccion.precio!.moneda,
              traTipoPrecio: transaccion.precio!.precio ? transaccion.precio!.id : undefined,
              traFactorConversion: !transaccion.precio!.precio ? transaccion.precio!.id : undefined,
              traTipoTransaccion: this.facturaService.resolveTipoTransaccion(4),
              traMonto: operacion.cargo,
            }
          );

        }

        //Agregar descuentos
        if (operacion.descuento < 0) {
          consecutivo++;
          descuentos.push(
            {
              traConsecutivoInterno: consecutivo,
              traConsecutivoInternoPadre: padre,
              traBodega: transaccion.bodega!.bodega,
              traProducto: transaccion.producto.producto,
              traUnidadMedida: transaccion.producto.unidad_Medida,
              traCantidad: 0,
              traTipoCambio: this.tipoCambio,
              traMoneda: transaccion.precio!.moneda,
              traTipoPrecio: transaccion.precio!.precio ? transaccion.precio!.id : undefined,
              traFactorConversion: !transaccion.precio!.precio ? transaccion.precio!.id : undefined,
              traTipoTransaccion: this.facturaService.resolveTipoTransaccion(3),
              traMonto: operacion.cargo,
            }
          );
        }

      });


      transacciones.push(
        {
          traConsecutivoInterno: padre,
          traBodega: transaccion.bodega!.bodega,
          traProducto: transaccion.producto.producto,
          traUnidadMedida: transaccion.producto.unidad_Medida,
          traCantidad: 0,
          traTipoCambio: this.tipoCambio,
          traMoneda: transaccion.precio!.moneda,
          traTipoPrecio: transaccion.precio!.precio ? transaccion.precio!.id : undefined,
          traFactorConversion: !transaccion.precio!.precio ? transaccion.precio!.id : undefined,
          traTipoTransaccion: this.facturaService.resolveTipoTransaccion(transaccion.producto.tipo_Producto),
          traMonto: transaccion.cantidad * transaccion.precio!.precioU,
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
          tipoCargoAbono: monto.payment.tipo_Cargo_Abono,
          monto: monto.amount,
          cambio: monto.difference,
          tipoCambio: this.tipoCambio,
          moneda: transacciones[0].traMoneda,
          montoMoneda: monto.amount / this.tipoCambio,
          referencia: monto.reference,
          autorizacion: monto.authorization,
          banco: monto.bank?.banco,
          cuentaBancaria: monto.account?.id_Cuenta_Bancaria,
        }
      );
    });


    // Generar dos números aleatorios de 7 dígitos cada uno?
    let randomNumber1:number = Math.floor(Math.random() * 9000000) + 1000000;
    let randomNumber2:number = Math.floor(Math.random() * 9000000) + 1000000;
   
    // Combinar los dos números para formar uno de 14 dígitos
    let strNum1: string = randomNumber1.toString();
    let strNum2: string = randomNumber2.toString();
    let combinedStr:string = strNum1 + strNum2;
    let combinedNum:number = parseInt(combinedStr, 10);

    let totalCA:number = 0;

    this.facturaService.montos.forEach(monto => {
      totalCA += monto.amount;
    });


    //Obtener fecha y hora actual
    let currentDate: Date = new Date();

    let doc:DocEstructuraInterface = {
      docCaMonto : totalCA,
      docTraMonto : this.facturaService.total,
      docIdCertificador:1, //TODO:Parametrizar certificador
      docCuentaVendedor: this.facturaService.vendedor!.cuenta_Correntista,
      docIdDocumentoRef: combinedNum,
      docCuentaCorrentista: this.facturaService.cuenta!.cuenta_Correntista,
      docCuentaCta: this.facturaService.cuenta!.cuenta_Cta,
      docFechaDocumento: currentDate.toISOString(),
      docTipoDocumento: this.documento,
      docSerieDocumento: this.serie,
      docEmpresa:this.empresa,
      docEstacionTrabajo: this.estacion,
      docUserName:this.user,
      docObservacion1: this.observacion,
      docTipoPago:1, //TODO:Preguntar
      docElementoAsignado:1,//TODO:Preguntar
      docTransaccion:transacciones,
      docCargoAbono:pagos,


    }




  }



}
