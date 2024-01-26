import { CargoAbono, Documento, Transaccion } from '../../interfaces/doc-estructura.interface';
import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PostDocumentInterface } from '../../interfaces/post-document.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import { Certificador, Cliente, DocPrintModel, DocumentoData, Empresa, Item, Montos, Pago, PoweredBy } from 'src/app/interfaces/doc-print.interface';
import { DetallePrintInterface } from 'src/app/interfaces/detalle-print.interface';
import { EncabezadoPrintInterface } from 'src/app/interfaces/encabezado-print.interface';
import { PagoPrintInterface } from 'src/app/interfaces/pago-print.interface';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { TipoTransaccionInterface } from '../../interfaces/tipo-transaccion.interface';

@Component({
  selector: 'app-resumen-documento',
  templateUrl: './resumen-documento.component.html',
  styleUrls: ['./resumen-documento.component.scss'],
  providers: [
    DocumentService,
  ]
})
export class ResumenDocumentoComponent implements OnInit {

  isLoading: boolean = false; //pantalla de carga
  readonly regresar: number = 4; //id de la pantalla
  verError: boolean = false; //ocultar y mostrar pantalla de error

  volver: number = 2;//volver a resumen desde configurar impresora
  idPantalla: number = 1;
  observacion = ""; //input para agreagar una observacion

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion
  documento: number = this.facturaService.tipoDocumento!; //documento de la sesion
  serie: string = this.facturaService.serie!.serie_Documento; //serie de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; //tipo cambio dispoible

  verVistaPrevia: boolean = false;

  consecutivoDoc: number = -1;
  docPrint?: DocPrintModel;

  constructor(
    //instancias de los servicios necesarios
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _documentService: DocumentService,
    private _translate: TranslateService,

  ) {

    //suscripcion a eventos del hijo (pantalla error)
    this._eventService.regresarResumen$.subscribe((eventData) => {
      this.verError = false;
    });
    //regreesar desde configuracion de la impresora con vista previa activa
    this._eventService.regresarResumen$.subscribe((eventData) => {
      this.verVistaPrevia = false;
    });

  }
  ngOnInit(): void {
    // console.log(this.consecutivoDoc);

  }

  //Regresar al modulo de facturacion (tabs)
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }


  //visualizar pantalla de error
  mostrarError(res: ResApiInterface) {

    //fecha actual
    let dateNow: Date = new Date();

    //Detalles del error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error en preferencias
    PreferencesService.error = error;

    //ver pantalla de error
    this.verError = true;
  }

  //Confirmar documento
  async sendDoc() {
    //Si se permite fel entrar al proceso
    if (this.facturaService.printFel()) {
      //alerta FEL no disponible
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.certificacionNoDisponible'));
    } else {
      //Enviar documento a tbl_documento estructura
      this.sendDocument()
    }




  }

  async printDoc() {

    this.verVistaPrevia = true;
    this.isLoading = true;

    let resEncabezado: ResApiInterface = await this._documentService.getEncabezados(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );

    if (!resEncabezado.status) {

      this.isLoading = false;

      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resEncabezado);

      return;

    }

    let encabezados: EncabezadoPrintInterface[] = resEncabezado.response;

    let resDetalles: ResApiInterface = await this._documentService.getDetalles(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );

    if (!resDetalles.status) {

      this.isLoading = false;

      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resDetalles);

      return;

    }

    let detalles: DetallePrintInterface[] = resDetalles.response;

    let resPagos: ResApiInterface = await this._documentService.getPagos(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );


    if (!resPagos.status) {

      this.isLoading = false;

      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resPagos);

      return;

    }

    this.isLoading = false;

    let pagos: PagoPrintInterface[] = resPagos.response;



    if (encabezados.length == 0) {
      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(
        //TODO:translate
        {
          response: "No se han encontrado encabezados para la impresion del documento, verifique el procedimiento almacenado.",
          status: false,
          storeProcedure: resEncabezado.storeProcedure,
        }
      );

      return;
    }


    let encabezado: EncabezadoPrintInterface = encabezados[0];

    let empresa: Empresa = {
      direccion: encabezado.empresa_Direccion ?? "",
      nit: encabezado.empresa_Nit ?? "",
      nombre: encabezado.empresa_Nombre ?? "",
      razonSocial: encabezado.razon_Social ?? "",
      tel: encabezado.empresa_Telefono ?? "",
    }


    let isFel: boolean = this.facturaService.printFel();

    let documento: DocumentoData = {
      //TODO:TRANSLATE
      titulo: encabezado.tipo_Documento?.toUpperCase()!,
      descripcion: isFel ? "FEL DOCUMENTO TRIBUTARIO ELECTRONICO" : "DOCUMENTO GENERICO",
      fechaCert: isFel ? encabezado.feL_fechaCertificacion : "",
      serie: isFel ? encabezado.feL_Serie : "",
      no: isFel ? encabezado.feL_numeroDocumento : "",
      autorizacion: isFel ? encabezado.feL_UUID : "",
      noInterno: `${encabezado.serie_Documento}-${encabezado.id_Documento}`,
    }

    let cuenta: ClienteInterface | undefined = this.facturaService.cuenta;


    let currentDate: Date = new Date();

    let cliente: Cliente = {
      nombre: cuenta?.factura_Nombre ?? "",
      direccion: cuenta?.factura_Direccion ?? "",
      nit: cuenta?.factura_NIT ?? "",
      tel: cuenta?.telefono ?? "",
      fecha: currentDate,
    }

    let cargo: number = 0;
    let descuento: number = 0;
    let subtotal: number = 0;
    let total: number = 0;

    let items: Item[] = [];


    detalles.forEach(detail => {
      let tipoTra: number = this.findTipoProducto(detail.tipo_Transaccion);

      if (tipoTra == 4) {
        //4 cargo
        cargo += detail.monto;
      } else if (tipoTra == 3) {
        //5 descuento
        descuento += detail.monto;
      } else {
        //cualquier otro
        subtotal += detail.monto;
      }

      items.push(
        {
          descripcion: detail.des_Producto,
          cantidad: detail.cantidad,
          unitario: tipoTra == 3
            ? "- ${detail.montoUMTipoMoneda}"
            : detail.monto_U_M_Tipo_Moneda,
          total: tipoTra == 3
            ? "- ${detail.montoTotalTipoMoneda}"
            : detail.monto_Total_Tipo_Moneda,
        }
      );
    });

    total += (subtotal + cargo) + descuento;

    let montos: Montos = {
      subtotal: subtotal,
      cargos: cargo,
      descuentos: descuento,
      total: total,
      totalLetras: encabezado.monto_Letras!.toUpperCase(),
    }

    let pagosP: Pago[] = [];

    pagos.forEach(pago => {

      pagosP.push(
        {
          tipoPago: pago.fDes_Tipo_Cargo_Abono,
          monto: pago.monto,
          pago: pago.monto + pago.cambio,
          cambio: pago.cambio,
        }
      );
    });


    let vendedor: string = "";

    if (this.facturaService.vendedores.length > 0) {
      vendedor = this.facturaService.vendedor!.nom_Cuenta_Correntista;
    }

    let certificador: Certificador;

    if (isFel) {
      certificador = {
        nit: encabezado.certificador_DTE_NIT!,
        nombre: encabezado.certificador_DTE_Nombre!,
      }
    }



    //TODO:Translate
    let mensajes: string[] = [
      //TODO: Mostrar frase
      // "**Sujeto a pagos trimestrales**",
      "*NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES*"
    ];

    let poweredBy: PoweredBy = {
      nombre: "Desarrollo Moderno de Software S.A.",
      website: "www.demosoft.com.gt",
    }


    this.docPrint = {
      empresa: empresa,
      documento: documento,
      cliente: cliente,
      items: items,
      montos: montos,
      pagos: pagosP,
      vendedor: vendedor,
      certificador: certificador!,
      observacion: this.observacion,
      mensajes: mensajes,
      poweredBy: poweredBy,
    }




    //  return;
    // //abre dialoogo de impresion o pantalla de configuracion
    // if (PreferencesService.vistaPrevia == '0') {
    //   console.log("abirir ialogo de imprimiendo");

    //   let verificador = await this._notificationService.openDialogActions(
    //     {
    //       title: "Imprimiendo",
    //       description: "El documento se esta imprimiendo.",
    //       verdadero: this._translate.instant('pos.botones.aceptar'),
    //     }
    //   );

    // } else {
    //   //ver vista previa de impresion
    //   console.log("mostar configiracion de impresora");
    //   this.verVistaPrevia = true;
    // }
  }


  findTipoProducto(tipoTra: number) {

    let transacciones: TipoTransaccionInterface[] = this.facturaService.tiposTransaccion;



    //buscar tipo de trabsaccion dependientdo del tipo de producto
    for (let i = 0; i < transacciones.length; i++) {
      const element = transacciones[i];
      if (tipoTra == element.tipo) {
        //Devolver tipo de transaccion correspondiente al tipo de producto
        return element.tipo_Transaccion;
      }
    }

    //si no encontró el tipo de producto retorna 0
    return 0;
  }


  //Creacion del documnto en tbl_documento estructura
  async sendDocument() {

    //Cargo abono  para el documento
    let pagos: CargoAbono[] = [];
    //transacciones para el docummento
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

          //aumnetar id de la transaccion
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

          //aumnetar id de la transaccion
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
              Tra_Monto: operacion.descuento,
            }
          );
        }

      });

      //agregar transacion (que no sea cargo o descuento)
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


      //agregar cargos al documento
      cargos.forEach(cargo => {
        transacciones.push(cargo);
      });


      //agegar descuentos   al documento
      descuentos.forEach(descuento => {
        transacciones.push(descuento);
      });

      //aumnetar id de la transaccion
      consecutivo++;

    });

    //agreagar cargo abono a la estructrura
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

    //ref id
    let combinedNum: number = parseInt(combinedStr, 10);

    //total cargo abono
    let totalCA: number = 0;

    this.facturaService.montos.forEach(monto => {
      totalCA += monto.amount;
    });


    //Obtener fecha y hora actual
    let currentDate: Date = new Date();

    //documento estructura
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

    //onjeto para el api
    let document: PostDocumentInterface = {
      estructura: JSON.stringify(doc),
      user: this.user,
    }

    this.isLoading = true;
    //consumo del servico para crear el documento
    let resDoc = await this._documentService.postDocument(this.token, document);

    this.isLoading = false;

    //Si algo salió mal mostrar error
    if (!resDoc.status) {

      this.isLoading = false;


      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resDoc);

      return;

    }




    this.consecutivoDoc = resDoc.response.data;


    //Si todo está correcto mostrar alerta
    this._notificationService.openSnackbar(this._translate.instant('pos.alertas.documentoCreado'));
  }





}
