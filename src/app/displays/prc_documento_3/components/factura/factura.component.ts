import { ClienteInterface } from '../../interfaces/cliente.interface';
import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { components } from 'src/app/providers/componentes.provider';
import { CuentaService } from '../../services/cuenta.service';
import { DataUserService } from '../../services/data-user.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PagoService } from '../../services/pago.service';
import { ParametroService } from '../../services/parametro.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { SerieService } from '../../services/serie.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { TranslateService } from '@ngx-translate/core';
import { ReferenciaService } from '../../services/referencia.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { OriginDocInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/origin-doc.interface';
import { ProductService } from '../../services/product.service';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { BodegaProductoInterface } from '../../interfaces/bodega-produto.interface';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { DocLocalInterface } from '../../interfaces/doc-local.interface';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { PrecioDiaInterface } from '../../interfaces/precio-dia.interface';
import { UpdateDocInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/update-doc.interface';
import { UpdateRefInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/update-ref-interface';
import { TypeErrorInterface } from 'src/app/interfaces/type-error.interface';
import { NewTransactionInterface } from '../../interfaces/new-transaction.interface';
import { ReceptionService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/reception.service';
import { Certificador, Cliente, DocPrintModel, DocumentoData, Empresa, Fechas, Item, Montos, ObservacionesRef, Pago, PoweredBy } from 'src/app/interfaces/doc-print.interface';
import { DataFelInterface } from '../../interfaces/data-fel.interface';
import { CargoAbono, Documento, Transaccion } from '../../interfaces/doc-estructura.interface';
import { PostDocumentInterface } from '../../interfaces/post-document.interface';
import { DocumentService } from '../../services/document.service';
import { FelService } from '../../services/fel.service';
import { CredencialInterface } from '../../interfaces/credencial.interface';
import { DataInfileInterface } from '../../interfaces/data.infile.interface';
import { DocXMLInterface } from '../../interfaces/doc-xml.interface';
import { ParamUpdateXMLInterface } from '../../interfaces/param-update-xml.interface';
import { DetallePrintInterface } from 'src/app/interfaces/detalle-print.interface';
import { EncabezadoPrintInterface } from 'src/app/interfaces/encabezado-print.interface';
import { PagoPrintInterface } from 'src/app/interfaces/pago-print.interface';
import { CurrencyPipe } from '@angular/common';
import { PrinterService } from 'src/app/services/printer.service';
import { RetryService } from 'src/app/services/retry.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';


import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss'],
  providers: [
    SerieService,
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
    ReferenciaService,
    ProductService,
    ReceptionService,
    DocumentService,
    FelService,
    CurrencyPipe,
    PrinterService,
  ]
})
export class FacturaComponent implements OnInit {




  consecutivoDoc: number = -1;
  docPrint?: DocPrintModel;
  dataFel?: DataFelInterface;
  docGlobal?: Documento;

  readonly regresar: number = 1; //id de la pnatalla
  readonly pasos: number = 15; //id de regresar a pasos
  cuenta?: ClienteInterface; //cuenta que se va a editar 
  vistaFactura: boolean = true; //mostrar mmodulo (tabs)
  nuevoCliente: boolean = false;  //mostrar pantalla para crear cuenta correntista
  actualizarCliente: boolean = false; //mostrar pantalla para actualizar cunata correntista
  vistaResumen: boolean = false;  //ver confirmacion del documento
  vistaHistorial: boolean = false;  //ver historial de docuemmntos recientes
  vistaInforme: boolean = false; //ver informe de errores

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento?: number = this.facturaService.tipoDocumento; //tipo docuemnto seleccionado
  nombreDocumento: string = this.facturaService.documentoName; //Descripcion del tipo de documento
  timer: any; //temporizador

  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;
  cambiarFiltro: boolean = false;

  constructor(
    //Instancia de los servicios que se van a utilizar
    private _notificationService: NotificationsService,
    private _eventService: EventService,
    public dataUserService: DataUserService,
    public facturaService: FacturaService,
    private _serieService: SerieService,
    private _cuentaService: CuentaService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
    private _translate: TranslateService,
    private _referenciaService: ReferenciaService,
    private _calendar: NgbCalendar,
    public globalConvertService: GlobalConvertService,
    private _productService: ProductService,
    private _recpetionService: ReceptionService,
    private _documentService: DocumentService,
    private _felService: FelService,
    private currencyPipe: CurrencyPipe,
    private _printService: PrinterService,
    private _retryService: RetryService,
    private _dataUserService: DataUserService,
  ) {

    //sucripcion a eventos desde componentes hijo

    //Ver pantalla crear cuenta correntista
    this._eventService.verCrear$.subscribe((eventData) => {
      this.verNuevoCliente();
    });

    //ver pantalla actualizar cuenta correntista
    this._eventService.verActualizar$.subscribe((eventData) => {
      this.cuenta = eventData;
      this.verActualizarCliente();
    });

    //ver modulo factura
    this._eventService.verDocumento$.subscribe((eventData) => {
      this.verDocumento();
    });

    //ver modulo factura
    this._eventService.verResumen$.subscribe((eventData) => {
      this.verDocumento();
    });

    //Ver pantalla de hisrorial de documentos
    this._eventService.verHistorial$.subscribe((eventData) => {
      this.verHistorial();
    });

    //Ver pantalla de informe de errores
    this._eventService.verInformeError$.subscribe((eventData) => {
      this.verInformeError();
    });

    //Ver pantalla de informe de errores
    this._eventService.regresarAPasos$.subscribe((eventData) => {
      this.verPasos();
    });

  }


  ngOnInit(): void {


    this._retryService.createDoc$.subscribe(() => {
      this.sendDoc();
    });

    this._retryService.felProcess$.subscribe(() => {
      this.retryFel();
    });


    this._retryService.printFormat$.subscribe(() => {
      this.printFormat();
    });

    //cargar datos necearios al inicio de la aplicacion
    this.loadData();

    this.facturaService.filtroPreferencia = PreferencesService.filtroProducto;
    this.facturaService.idFiltroPreferencia = PreferencesService.idFiltroProducto;

    // if (PreferencesService.nuevoDoc.length == 0) {
    //   PreferencesService.nuevoDoc = "0";
    //   this.facturaService.nuevoDoc = false;
    // } else if (PreferencesService.nuevoDoc == "1") {
    //   this.facturaService.nuevoDoc = true;
    // }

    //mostrar alerta sino hay preferencia guardada
    if (PreferencesService.mostrarAlerta.length == 0 || PreferencesService.mostrarAlerta == "1") {
      //no marcar checkbox 
      this.facturaService.noMostrar = false;
      //si es 0 ocular y marcar el checkbox
    } else if (PreferencesService.mostrarAlerta == "0") {
      this.facturaService.noMostrar = true;
    }
  }



  async loadDocumentLocal() {

    this.facturaService.isLoading = true;

    //str to object para documento estructura
    let doc: DocLocalInterface = JSON.parse(PreferencesService.documento);

    if (!this.facturaService.serie) {
      //Cargar serie del documento guardado
      for (let i = 0; i < this.facturaService.series.length; i++) {
        const element = this.facturaService.series[i];

        if (element.serie_Documento == doc.serie!.serie_Documento) {
          this.facturaService.serie = element;
          this.facturaService.serieCopy = element;
        }
      }
    }




    //buscar vendedores
    let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
      this.user,
      this.token,
      this.tipoDocumento!,
      this.facturaService.serie!.serie_Documento,
      this.empresa.empresa,
    )

    //si algo salió mal mostrar error
    if (!resVendedor.status) {
      this.facturaService.isLoading = false;
      this.verError(resVendedor);

      return;
    }


    //cuntas correntista ref disponibles
    this.facturaService.vendedores = resVendedor.response;

    //si solo hay un vendedor seleccionarlo por defecto
    if (this.facturaService.vendedores.length == 1) {
      this.facturaService.vendedor = this.facturaService.vendedores[0];
    }

    //Buscar tipos transaccion
    let resTransaccion: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
      this.user,
      this.token,
      this.tipoDocumento!,
      this.facturaService.serie!.serie_Documento,
      this.empresa.empresa,
    );

    //si algo salio mal
    if (!resTransaccion.status) {
      this.facturaService.isLoading = false;
      this.verError(resTransaccion);

      return;
    }

    //tioos de trabnsaccion disponibles
    this.facturaService.tiposTransaccion = resTransaccion.response;

    //Buscar parametros del documento
    let resParametro: ResApiInterface = await this._parametroService.getParametro(
      this.user,
      this.token,
      this.tipoDocumento!,
      this.facturaService.serie!.serie_Documento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
    )



    //si algo salio mal
    if (!resParametro.status) {
      this.facturaService.isLoading = false;
      this.verError(resParametro);

      return;
    }

    //Parammetros disponibles
    this.facturaService.parametros = resParametro.response;

    //Buscar formas de pago
    let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
      this.token,
      this.empresa.empresa,
      this.facturaService.serie!.serie_Documento,
      this.tipoDocumento!,
    );

    //si algo salio mal
    if (!resFormaPago.status) {
      this.facturaService.isLoading = false;

      this.verError(resFormaPago);

      return;

    }
    //cargar tipo referencia (evento)



    //Formas de pago disponobles
    this.facturaService.formasPago = resFormaPago.response;


    //si hay vendedor cargarlo
    if (doc.vendedor) {

      for (let i = 0; i < this.facturaService.vendedores.length; i++) {
        const element = this.facturaService.vendedores[i];

        //Asignaer vendedor guardado
        if (element.cuenta_Correntista == doc.vendedor!.cuenta_Correntista) {
          this.facturaService.vendedor = element;
        }
      }
    }


    if (this.facturaService.valueParametro(58)) {

      this.facturaService.tipoReferencia = undefined;
      this.facturaService.tiposReferencia = [];


      let resTipoRefencia: ResApiInterface = await this._referenciaService.getTipoReferencia(this.user, this.token);


      //si algo salio mal
      if (!resTipoRefencia.status) {
        this.facturaService.isLoading = false;

        this.verError(resTipoRefencia);

        return;

      }


      this.facturaService.tiposReferencia = resTipoRefencia.response;

      if (doc.tipoRef) {
        for (let i = 0; i < this.facturaService.tiposReferencia.length; i++) {
          const element = this.facturaService.tiposReferencia[i];
          if (element.tipo_Referencia == doc.tipoRef.tipo_Referencia) {
            this.facturaService.tipoReferencia = element;;

          }
        }

      }

    }

    //evaluar fechas y observaciones
    if (this.facturaService.valueParametro(381)) {

      this.facturaService.fechaRefIni = new Date(doc.refFechaEntrega!);
      //set dates in inputs
      this.facturaService.inputFechaRefIni = {
        year: this.facturaService.fechaRefIni.getFullYear(),
        day: this.facturaService.fechaRefIni.getDate(),
        month: this.facturaService.fechaRefIni.getMonth() + 1,
      }

      this.facturaService.formControlHoraRefIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefIni));
    }

    if (this.facturaService.valueParametro(382)) {
      this.facturaService.fechaRefFin = new Date(doc.refFechaRecoger!);
      this.facturaService.inputFechaRefFin = {
        year: this.facturaService.fechaRefFin.getFullYear(),
        day: this.facturaService.fechaRefFin.getDate(),
        month: this.facturaService.fechaRefFin.getMonth() + 1,
      }
      this.facturaService.formControlHoraRefFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefFin));

    }

    if (this.facturaService.valueParametro(44)) {


      //load dates 
      this.facturaService.fechaIni = new Date(doc.refFechaInicio!);
      this.facturaService.fechaFin = new Date(doc.refFechaFin!);



      this.facturaService.inputFechaIni = {
        year: this.facturaService.fechaIni.getFullYear(),
        day: this.facturaService.fechaIni.getDate(),
        month: this.facturaService.fechaIni.getMonth() + 1,
      }

      this.facturaService.inputFechaFinal = {
        year: this.facturaService.fechaFin.getFullYear(),
        day: this.facturaService.fechaFin.getDate(),
        month: this.facturaService.fechaFin.getMonth() + 1,
      }

      //set time
      this.facturaService.formControlHoraIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaIni));
      this.facturaService.formControlHoraFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaFin));

    }


    if (this.facturaService.valueParametro(385)) {
      this.facturaService.refContacto = doc.refContacto;

    }

    if (this.facturaService.valueParametro(383)) {

      this.facturaService.refDescripcion = doc.refDescripcion;
    }

    if (this.facturaService.valueParametro(386)) {

      this.facturaService.refDireccionEntrega = doc.refDireccionEntrega;
    }

    if (this.facturaService.valueParametro(384)) {

      this.facturaService.refObservacion = doc.refObservacion;
    }


    this.facturaService.cuenta = doc.cliente; //asignar cliente
    this.facturaService.traInternas = doc.detalles; //asignar detalles
    this.facturaService.montos = doc.pagos; //asignar pagos


    //calcular totales del documento y pagos
    this.facturaService.calculateTotales();

    this.facturaService.isLoading = false;

  }

  //nuevo documento
  async newDoc() {

    //si la preferencia guardada es distinda de 1, mostrará la alerta
    if (PreferencesService.mostrarAlerta.length == 0 || PreferencesService.mostrarAlerta == "1") {

      //Dialofo de confirmacion
      let verificador: boolean = await this._notificationService.openDialogNewDoc(
        {
          title: this._translate.instant('pos.alertas.eliminar'),
          description: this._translate.instant('pos.alertas.perderDatos'),
          verdadero: this._translate.instant('pos.botones.aceptar'),
          falso: this._translate.instant('pos.botones.cancelar'),
        }
      );

      if (!verificador) return;
    }

    this.setValuesNewDoc();

  }


  setValuesNewDoc() {
    //en caso contrario, limpiará el formulario sin mostrar la alerta

    //limpiar todos los datos relacionados al documennto
    this.facturaService.cuenta = undefined; //cuneta correntista seleccionada
    this.facturaService.montos = []; //cargo abonos agregaods al documento
    this.facturaService.traInternas = []; //transacciones agregadas al documento
    this.facturaService.selectAllTra = false; //sleeccionar todas las transaciones (false)
    this.facturaService.subtotal = 0; //reniciar subtotal del documento
    this.facturaService.cargo = 0;  //reiniciar cargos el documento
    this.facturaService.descuento = 0;  //reiniciar descuentos del documento
    this.facturaService.total = 0;  //reiniciar toral del documenmto
    this.facturaService.saldo = 0;  //reiniciar saldo del documento
    this.facturaService.cambio = 0; //reiniciar cambio del documento
    this.facturaService.pagado = 0; //reiniciar monto pagado del
    this.facturaService.tipoReferencia = undefined;
    this.facturaService.fechaRefIni = undefined;
    this.facturaService.fechaRefFin = undefined;
    this.facturaService.fechaIni = undefined;
    this.facturaService.fechaFin = undefined;
    this.facturaService.refContacto = undefined;
    this.facturaService.refDescripcion = undefined;
    this.facturaService.refDireccionEntrega = undefined;
    this.facturaService.refObservacion = undefined;
    this.facturaService.observacion = "";
    this.facturaService.terminosyCondiciones = this.facturaService.copiaTerminosyCondiciones;


    this.setDateNow();
    this.facturaService.setIdDocumentoRef();



    //si hay solo una serie disponoble
    if (this.facturaService.series.length == 1) {
      //seleccionar la serie
      this.facturaService.serie = this.facturaService.series[0];
      this.facturaService.serieCopy = this.facturaService.series[0];
    } else {
      //si hay mas de una no seleccionar ninguna
      this.facturaService.serie = undefined
      this.facturaService.serieCopy = undefined;
    }


    //si hay solo una tipo referencia disponoble
    if (this.facturaService.tiposReferencia.length == 1) {
      //seleccionar la tipo referencia
      this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
    } else {
      //si hay mas de una no seleccionar ninguna
      this.facturaService.tipoReferencia = undefined
    }

    //si solo un vendedor dipsonible
    if (this.facturaService.vendedores.length == 1) {
      //seleccionar el vendedor
      this.facturaService.vendedor = this.facturaService.vendedores[0];

    } else {
      //si hay mas de uno no sleccionarlo
      this.facturaService.vendedor = undefined; //

    }

    //Mostrar tab documento (primer pestaña)
    this.facturaService.showDocumento();

    //limpiar documento local 
    PreferencesService.documento = "";
  }

  setDateNow() {

    //Fecha Actual
    let dateNow: Date = new Date;
    //asignar fecha actual
    this.facturaService.fecha = dateNow;
    //fecha min para los pickers
    this.facturaService.fechaStruct = UtilitiesService.getStructureDate(dateNow);

    //asignar fechas a fechas referencia inicio
    this.facturaService.fechaRefIni = new Date(dateNow);

    //asignar fehca inicio doc
    this.facturaService.fechaIni = new Date(this.facturaService.fechaRefIni);

    //a la fehca inicio documento sumarle 30 minutos
    let addDateIni: Date = new Date(this.facturaService.fechaIni);

    //nueva fecha ini + 30 min
    this.facturaService.fechaIni.setTime(addDateIni.getTime() + (30 * 60000));

    //asiganr fecha fin
    this.facturaService.fechaFin = new Date(this.facturaService.fechaIni);

    //a la fehca inicio documento sumarle 30 minutos
    let addDateFin: Date = new Date(this.facturaService.fechaFin);

    //nueva fecha fin + 30 min
    this.facturaService.fechaFin.setTime(addDateFin.getTime() + (30 * 60000));

    //asignar fehca fin ref
    this.facturaService.fechaRefFin = new Date(this.facturaService.fechaFin);


    //a la fehca inicio documento sumarle 30 minutos
    let addDateFinRef: Date = new Date(this.facturaService.fechaRefFin);

    //nueva fecha fin + 30 min
    this.facturaService.fechaRefFin.setTime(addDateFinRef.getTime() + (30 * 60000));


    // Inicializar selectedDate con la fecha de hoy
    this.facturaService.inputFechaRefIni = UtilitiesService.getStructureDate(this.facturaService.fechaRefIni);
    this.facturaService.inputFechaRefFin = UtilitiesService.getStructureDate(this.facturaService.fechaRefFin);
    this.facturaService.inputFechaIni = UtilitiesService.getStructureDate(this.facturaService.fechaIni);
    this.facturaService.inputFechaFinal = UtilitiesService.getStructureDate(this.facturaService.fechaFin);

    //agregar horas a las selectTime
    this.facturaService.formControlHoraRefIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefIni));
    this.facturaService.formControlHoraRefFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefFin));
    this.facturaService.formControlHoraIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaIni));
    this.facturaService.formControlHoraFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaFin));



    //Copiar valores (Valores anteriores a una modificacion)
    this.facturaService.copyFechaRefIni = new Date(this.facturaService.fechaRefIni);
    this.facturaService.copyFechaRefFin = new Date(this.facturaService.fechaRefFin);
    this.facturaService.copyFechaIni = new Date(this.facturaService.fechaIni);
    this.facturaService.copyFechaFin = new Date(this.facturaService.fechaFin);


  }

  //cargar datos necesarios
  async loadData() {
    this.facturaService.setIdDocumentoRef();


    //limpiar datos del modulo
    this.facturaService.clearData();
    this.setDateNow();



    //Seleccionar primera pestaña (petssña documento)
    this.facturaService.showDocumento();

    //Si no hay tipo de documento validar
    if (!this.facturaService.tipoDocumento) {
      this.verError({
        response: this._translate.instant('pos.factura.sin_tipo_documento'),
        status: false,
      })
      return;
    }

    //Datos de la sesion
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;
    let estacion: number = PreferencesService.estacion.estacion_Trabajo;
    let documento: number = this.facturaService.tipoDocumento;

    this.facturaService.isLoading = true;

    //Buscar series
    let resSeries: ResApiInterface = await this._serieService.getSerie(
      user,
      token,
      documento,
      empresa,
      estacion,
    );

    //si algo salio al
    if (!resSeries.status) {
      this.facturaService.isLoading = false;
      this.verError(resSeries);
      return;
    }

    //Series disponobles
    this.facturaService.series = resSeries.response;

    if (this.facturaService.series.length == 1) {
      //seleccionar serie
      this.facturaService.serie = this.facturaService.series[0];
      this.facturaService.serieCopy = this.facturaService.series[0];
    }


    if (this.globalConvertService.editDoc) {
      let origin: OriginDocInterface = this.globalConvertService.docOriginSelect!;

      for (let i = 0; i < this.facturaService.series.length; i++) {
        const element = this.facturaService.series[i];
        if (origin.serie_Documento == element.serie_Documento) {
          this.facturaService.serie = element;
          break;
        }
      }

    }

    //si solo hay una serie seleccionarla por defecto;
    if (this.facturaService.serie) {

      let serie: string = this.facturaService.serie!.serie_Documento;

      //buscar vendedores
      let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
        user,
        token,
        documento,
        serie,
        empresa,
      )

      //si algo salió mal mostrar error
      if (!resVendedor.status) {
        this.facturaService.isLoading = false;
        this.verError(resVendedor);

        return;
      }


      //cuntas correntista ref disponibles
      this.facturaService.vendedores = resVendedor.response;

      //si solo hay un vendedor seleccionarlo por defecto
      if (this.facturaService.vendedores.length == 1) {
        this.facturaService.vendedor = this.facturaService.vendedores[0];
      }

      //Buscar tipos transaccion
      let resTransaccion: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
        user,
        token,
        documento,
        serie,
        empresa,
      );

      //si algo salio mal
      if (!resTransaccion.status) {
        this.facturaService.isLoading = false;
        this.verError(resTransaccion);

        return;
      }

      //tioos de trabnsaccion disponibles
      this.facturaService.tiposTransaccion = resTransaccion.response;

      //Buscar parametros del documento
      let resParametro: ResApiInterface = await this._parametroService.getParametro(
        user,
        token,
        documento,
        serie,
        empresa,
        estacion,
      )



      //si algo salio mal
      if (!resParametro.status) {
        this.facturaService.isLoading = false;
        this.verError(resParametro);

        return;
      }

      //Parammetros disponibles
      this.facturaService.parametros = resParametro.response;




      //Buscar formas de pago
      let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
        token,
        empresa,
        serie,
        documento,
      );

      //si algo salio mal
      if (!resFormaPago.status) {
        this.facturaService.isLoading = false;

        this.verError(resFormaPago);

        return;

      }

      //Formas de pago disponobles
      this.facturaService.formasPago = resFormaPago.response;

    }


    if (this.facturaService.valueParametro(58)) {

      this.facturaService.tipoReferencia = undefined;
      this.facturaService.tiposReferencia = [];


      let resTipoRefencia: ResApiInterface = await this._referenciaService.getTipoReferencia(user, token);


      //si algo salio mal
      if (!resTipoRefencia.status) {
        this.facturaService.isLoading = false;

        this.verError(resTipoRefencia);

        return;

      }


      this.facturaService.tiposReferencia = resTipoRefencia.response;


      if (this.facturaService.tiposReferencia.length == 1) {
        this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
      }

    }


    //cargar documento guardado localmente

    if (!this.globalConvertService.editDoc) {

      this.facturaService.isLoading = false;

      let reloadDoc: boolean = await this.facturaService.loadDocSave();

      if (!reloadDoc) return;

      //Dialogo para cargar documento guardado
      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.docEncontrado'),
          description: this._translate.instant('pos.alertas.recuperar'),
        }
      );

      if (!verificador) return;

      this.loadDocumentLocal();

      return;
    }

    //Cargar datos del docuemnto origen

    //Verificar serie

    let docOrigin: OriginDocInterface = this.globalConvertService.docOriginSelect!;

    if (docOrigin.tipo_Referencia != null) {
      let existRef: number = -1;

      for (let i = 0; i < this.facturaService.tiposReferencia.length; i++) {
        const element = this.facturaService.tiposReferencia[i];
        if (element.tipo_Referencia == docOrigin.tipo_Referencia) {
          existRef = i;
          break;
        }
      }


      if (existRef == -1) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.tipoRefNoEncontrado'));
      } else {

        this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[existRef];
      }

    }
    //realizar la busqyeda de la cuenta ref si hay elementos en la lista
    if (this.facturaService.vendedores.length > 0) {
      let existCuentaRef: number = -1;

      for (let i = 0; i < this.facturaService.vendedores.length; i++) {
        const element = this.facturaService.vendedores[i];
        if (element.cuenta_Correntista == docOrigin.cuenta_Correntista_Ref) {
          existCuentaRef = i;
          break;
        }
      }

      if (existCuentaRef == -1) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaNoEncontrada'));
      } else {
        this.facturaService.vendedor = this.facturaService.vendedores[existCuentaRef];
      }

    }


    //--EMpiezan datos
    //Cargar cliente
    let resClient: ResApiInterface = await this._cuentaService.getClient(
      user,
      token,
      empresa,
      docOrigin.nit,

    );

    //si algo salio mal
    if (!resClient.status) {
      this.facturaService.isLoading = false;

      this.verError(resClient);

      return;

    }

    //Buscar cliente y asiganrlo
    let clients: ClienteInterface[] = resClient.response;


    let existClient: number = -1;

    for (let i = 0; i < clients.length; i++) {
      const element = clients[i];
      if (element.cuenta_Correntista == docOrigin.cuenta_Correntista) {
        existClient = i;
        break;
      }
    }

    if (existClient == -1) {
      this.facturaService.cuenta = {
        cuenta_Correntista: 1,
        cuenta_Cta: docOrigin.cuenta_Cta,
        factura_Nombre: docOrigin.cliente,
        factura_NIT: docOrigin.nit,
        factura_Direccion: docOrigin.direccion,
        cC_Direccion: docOrigin.direccion,
        des_Cuenta_Cta: docOrigin.nit,
        direccion_1_Cuenta_Cta: docOrigin.direccion,
        eMail: "",
        telefono: "",
        limite_Credito: 0,
        permitir_CxC: false,
        celular: null,
        des_Grupo_Cuenta: null,
        grupo_Cuenta: null
      }

    } else {
      this.facturaService.cuenta = clients[existClient];
    }

    //Set dates and observaciones
    let dateDefault: Date = new Date()

    //load dates 
    this.facturaService.fechaRefIni = new Date(docOrigin.referencia_D_Fecha_Ini ?? dateDefault);
    this.facturaService.fechaRefFin = new Date(docOrigin.referencia_D_Fecha_Fin ?? dateDefault);
    this.facturaService.fechaIni = new Date(docOrigin.fecha_Ini ?? dateDefault);
    this.facturaService.fechaFin = new Date(docOrigin.fecha_Fin ?? dateDefault);


    //set dates in inputs
    this.facturaService.inputFechaRefIni = {
      year: this.facturaService.fechaRefIni.getFullYear(),
      day: this.facturaService.fechaRefIni.getDate(),
      month: this.facturaService.fechaRefIni.getMonth() + 1,
    }

    this.facturaService.inputFechaRefFin = {
      year: this.facturaService.fechaRefFin.getFullYear(),
      day: this.facturaService.fechaRefFin.getDate(),
      month: this.facturaService.fechaRefFin.getMonth() + 1,
    }

    this.facturaService.inputFechaIni = {
      year: this.facturaService.fechaIni.getFullYear(),
      day: this.facturaService.fechaIni.getDate(),
      month: this.facturaService.fechaIni.getMonth() + 1,
    }

    this.facturaService.inputFechaFinal = {
      year: this.facturaService.fechaFin.getFullYear(),
      day: this.facturaService.fechaFin.getDate(),
      month: this.facturaService.fechaFin.getMonth() + 1,
    }

    //set time
    this.facturaService.formControlHoraRefIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefIni));
    this.facturaService.formControlHoraRefFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefFin));
    this.facturaService.formControlHoraIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaIni));
    this.facturaService.formControlHoraFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaFin));

    //Set min time for inputs



    // set observaciones
    this.facturaService.refContacto = docOrigin.referencia_D_Observacion_2 ?? undefined;
    this.facturaService.refDescripcion = docOrigin.referencia_D_Descripcion ?? undefined;
    this.facturaService.refDireccionEntrega = docOrigin.referencia_D_Observacion_3 ?? undefined;
    this.facturaService.refObservacion = docOrigin.referencia_D_Observacion ?? undefined;
    this.facturaService.observacion = docOrigin.observacion_1;




    //TODO:Cargar productos
    for (const tra of this.globalConvertService.detailsOrigin) {
      let resProduct = await this._productService.getProduct(
        token,
        user,
        estacion,
        tra.detalle.id,
        0,
        100,
      );


      if (!resProduct.status) {
        this.facturaService.isLoading = false;

        this.verError(resProduct);

        return;
      }

      let productSearch: ProductoInterface[] = resProduct.response;


      let iProd: number = -1;

      for (let i = 0; i < productSearch.length; i++) {
        const element = productSearch[i];

        if (element.producto_Id = tra.detalle.id) {
          iProd = i;
          break;
        }

      }

      if (iProd == -1) {

        this.facturaService.isLoading = false;


        resProduct.response = "Error al cargar las transacciones, no se encontró un producto";

        this.verError(resProduct);

        return;



      }


      let prod: ProductoInterface = productSearch[iProd];

      //buscar bodegas del producto
      let resBodega = await this._productService.getBodegaProducto(
        user,
        token,
        empresa,
        estacion,
        prod.producto,
        prod.unidad_Medida,
      );


      if (!resBodega.status) {

        this.facturaService.isLoading = false;

        this.verError(resBodega);

        return;

      }

      let bodegas: BodegaProductoInterface[] = resBodega.response;

      let existBodega: number = -1;

      //Search bodega
      for (let i = 0; i < bodegas.length; i++) {
        const element = bodegas[i];
        if (element.bodega == tra.detalle.bodega) {
          existBodega = i;
          break;
        }
      }



      let bodega: BodegaProductoInterface;

      if (existBodega == -1) {
        //No hay bodegas
        bodega = {
          bodega: tra.detalle.bodega,
          existencia: 0,
          nombre: tra.detalle.bodega_Descripcion,
          posee_Componente: false,
        }

      } else {
        bodega = bodegas[existBodega];
      }


      //buscar precios
      let resPrecio = await this._productService.getPrecios(
        this.user,
        token,
        bodega.bodega,
        prod.producto,
        prod.unidad_Medida,
        this.facturaService.cuenta.cuenta_Correntista ?? 0,
        this.facturaService.cuenta.cuenta_Cta ?? "0",
      );



      if (!resPrecio.status) {

        this.facturaService.isLoading = false;

        this.verError(resPrecio);

        return;

      }

      let precios: PrecioInterface[] = resPrecio.response;


      let existPrecio: number = -1;

      for (let i = 0; i < precios.length; i++) {
        const element = precios[i];
        if (element.tipo_Precio = tra.detalle.tipo_Precio) {
          existPrecio = i;
          break;
        }
      }

      let precioSelect: UnitarioInterface;

      if (existPrecio == -1) {
        //TODO:Seacrh factor de conversion
        precioSelect = {
          descripcion: "Precio",
          id: tra.detalle.tipo_Precio,
          moneda: 1,
          orden: 1,
          precio: true,
          precioU: tra.detalle.disponible ? 0 : tra.detalle.monto / tra.detalle.disponible
        }
      } else {
        precioSelect = {
          descripcion: precios[existPrecio].des_Tipo_Precio,
          id: precios[existPrecio].tipo_Precio,
          moneda: precios[existPrecio].moneda,
          orden: precios[existPrecio].precio_Orden,
          precio: true,
          precioU: precios[existPrecio].precio_Unidad
        }
      }


      let precioDias: number = 0;
      let cantidadDias: number = 0;

      if (this.facturaService.valueParametro(351)) {




        let res: ResApiInterface = await this._productService.getFormulaPrecioU(
          token,
          this.facturaService.fechaIni,
          this.facturaService.fechaFin,
          precioSelect.precioU.toString(),
        );

        if (!res.status) {
          this._notificationService.openSnackbar(this._translate.instant('pos.alertas.noCalculoDias'));

          console.error(res);

          return;
        }

        let calculoDias: PrecioDiaInterface[] = res.response;

        if (calculoDias.length == 0) {

          res.response = "No se pudo obtener los resultados al hacer el calculo de precio por dias, verifica el procedimeinto."

          this._notificationService.openSnackbar(this._translate.instant('pos.alertas.noCalculoDias'));

          console.error(res);

          return;
        }

        precioDias = calculoDias[0].monto_Calculado;
        cantidadDias = calculoDias[0].catidad_Dia;

      }

      this.facturaService.addTransaction(
        {
          //TODO:Agregar montos por dia
          consecutivo: tra.detalle.transaccion_Consecutivo_Interno,
          estadoTra: 0,
          precioCantidad: precioSelect.precioU * tra.detalle.disponible,
          precioDia: precioDias,
          isChecked: false,
          bodega: bodega,
          producto: prod,
          precio: precioSelect,
          cantidad: tra.detalle.disponible,
          total: tra.detalle.monto,
          cargo: 0,
          cantidadDias: cantidadDias,
          descuento: 0,
          operaciones: [],
        }
      );


    }


    this.facturaService.transaccionesPorEliminar = []; //limpiar transacciones pendientes

    this.facturaService.isLoading = false;





  }

  //ver oabtalal crear cuenta correntista
  verNuevoCliente() {
    this.nuevoCliente = true;
    this.actualizarCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver pabtralla editar cuenta coprrenitsta
  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver modulo de factura
  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver histirial de documentos recienetes
  verHistorial() {
    this.vistaHistorial = true;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaInforme = false;
  }

  //ver informe de erroes
  verInformeError() {
    this.vistaInforme = true;
    this.vistaHistorial = false;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  //verError
  verError(res: ResApiInterface) {

    //fehca y hora ctual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error
    PreferencesService.error = error;

    //ver pantlla d error
    this.verInformeError();
  }


  //detectamos la tecla precionada
  @HostListener('document:keydown', ['$event'])
  //Manejo de eventos del declado
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log("Tecla presionada:", event.key);

    // Debe dirigirse a imprimir cuando:
    //la fecha presionada sea F9,
    //el display sea de Facturas
    if (event.key.toLowerCase() === "f9" && this.dataUserService.nameDisplay.toLowerCase() == "facturas") {
      //evita o bloquea la funcion que tiene por defecto
      event.preventDefault();
      //realiza la funcion que se necesite
      //Imprimir
      this.printDoc();
    }


    // ebe limpiar el formulario para un nuevo documento cuando:
    //la fecha presionada sea F1,
    //el display sea de Facturas
    if (event.key.toLowerCase() === "f1" && this.dataUserService.nameDisplay.toLowerCase() == "facturas") {
      //evita o bloquea la funcion que tiene por defecto
      event.preventDefault();
      //realiza la funcion que se necesite
      //Nuevo documento
      this.newDoc();
    }
  }

  activarDialogo() {
    if (this.facturaService.noMostrar) {
      PreferencesService.mostrarAlerta = "0";
    } else if (!this.facturaService.noMostrar) {
      PreferencesService.mostrarAlerta = "1";
    }
  }

  // nuevoDocImprimir() {
  //   //si es verdadero, la preferencia será 1;
  //   if (this.facturaService.nuevoDoc) {
  //     PreferencesService.nuevoDoc = "1";
  //   } else if (!this.facturaService.nuevoDoc) {
  //     PreferencesService.nuevoDoc = "0";
  //   }

  // }

  //Confirmar documento
  async printDoc() {

    //Si no hay serie seleccionado mostrar mensaje
    if (!this.facturaService.serie) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinSerie'));
      return;
    }

    //Si no hay cliente seleccioando mostrar mensaje
    if (!this.facturaService.cuenta) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinCliente'));
      return;
    }


    //si hay vendedores debe seleconarse uno
    if (this.facturaService.vendedores.length > 0) {
      //Si no hay cliente seleccioando mostrar mensaje
      if (!this.facturaService.vendedor) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinVendedor'));
        return;
      }
    }

    //si no hay transacciones mostrar mensaje
    if (this.facturaService.traInternas.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinTransacciones'));
      return;
    }

    //si hay formas de pago validar quye se agregue alguna
    if (this.facturaService.serie && this.facturaService.formasPago.length > 0) {
      if (this.facturaService.montos.length == 0) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinPagos'));
        return;
      }

      // si no se ha pagado el total mostrar mensaje
      if (this.facturaService.saldo > 0) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.saldoPendiente'));
        return;
      }
    }


    if (this.facturaService.valueParametro(58)) {
      if (!this.facturaService.tipoReferencia) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.seleccioneTipoRef'));
        return;
      }
    }

    if (this.facturaService.valueParametro(44)) {
      if (!this.validateDates()) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.restriccionFechas'));
        return;
      }
    }

    //validar fechas si existen

    if (this.facturaService.tipoDocumento! == 20) {
      let verificador: boolean = await this._notificationService.openDialogActions(
        {
          title: "¿Desea modificar terminos y condiciones para este documento?",
          description: "Podrá editar, eliminar y/o agregar terminos y condiciones.",
          falso: this._translate.instant('pos.botones.modificar'),
          verdadero: this._translate.instant('pos.botones.imprimir'),

        }
      );


      if (!verificador) {

        let resDialogMensajes = await this._notificationService.openTerms(this.facturaService.terminosyCondiciones);

        if (!resDialogMensajes) {
          this.facturaService.terminosyCondiciones = this.facturaService.copiaTerminosyCondiciones;
          return;
        }

        this.sendDoc();

        return;
      }

      this.facturaService.terminosyCondiciones = this.facturaService.copiaTerminosyCondiciones;

      this.sendDoc();

      return;

    }

    this.sendDoc();


  }



  // Función para comparar fechas ignorando los segundos
  compareDatesIgnoringSeconds(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setSeconds(0, 0);
    d2.setSeconds(0, 0);
    return d1.getTime() - d2.getTime();
  }

  // Función de validación


  validateDates() {
    // Remover los segundos de las fechas para la comparación
    this.facturaService.fecha!.setSeconds(0, 0);
    this.facturaService.fechaRefIni!.setSeconds(0, 0);
    this.facturaService.fechaRefFin!.setSeconds(0, 0);
    this.facturaService.fechaIni!.setSeconds(0, 0);
    this.facturaService.fechaFin!.setSeconds(0, 0);

    if (this.facturaService.fechaRefIni! >= this.facturaService.fecha! && this.facturaService.fechaRefIni! <= this.facturaService.fechaRefFin! &&
      this.facturaService.fechaRefFin! >= this.facturaService.fechaRefIni! &&
      this.facturaService.fechaIni! >= this.facturaService.fechaRefIni! && this.facturaService.fechaIni! <= this.facturaService.fechaRefFin! &&
      this.facturaService.fechaFin! >= this.facturaService.fechaIni! && this.facturaService.fechaFin! <= this.facturaService.fechaRefFin!) {
      return true;
    }
    return false;

  }
  //Confirmar documento
  async sendDoc() {

    //validar si es editar doc
    //TODO:Valiudar impresion
    if (this.globalConvertService.editDoc) {
      this.modifyDoc();
      return;
    }

    //TODO:En produccion evaluar parametro
    //Si se permite fel entrar al proceso
    //Inciar FEL
    if (this.facturaService.valueParametro(349)) {
      // if (this._dataUserService.switchState) {

      //iniciar cargas (steps)
      this.facturaService.pasosCompletos = 0;

      //iniciar cargas
      this.facturaService.pasos.forEach(element => {
        element.visible = true;
        element.status = 1;
      });

      //ocultar botones y mensajes
      this.facturaService.viewMessage = false;
      this.facturaService.viewError = false;
      this.facturaService.viewErrorFel = false;
      this.facturaService.viewErrorProcess = false;
      this.facturaService.viewSucces = false;
      this.facturaService.isStepLoading = true;

      let resSendDoc: TypeErrorInterface = await this.sendDocument();

      if (resSendDoc.type == 1) {
        //iniciar cargas
        this.facturaService.pasos.forEach(element => {
          element.visible = false;
          element.status = 3;
        });

        this.facturaService.viewErrorProcess = true;
        this.facturaService.viewError = true;
        this.facturaService.viewMessage = true;

        this.facturaService.stepMessage = this._translate.instant('pos.alerta.docSalioMal');

        this.saveError(resSendDoc.error);

        return;
      }

      //primer paso completo
      this.facturaService.pasosCompletos++;
      this.facturaService.pasos[0].status = 2;
      this.facturaService.pasos[0].visible = false;

      //Empezar proceso FEL 
      let resFelProcess: TypeErrorInterface = await this.felProcess();

      //evaluar respuesta proceso fel 
      if (resFelProcess.type == 1) {

        //No se completo el proceso fel
        this.facturaService.pasos[1].visible = false;
        this.facturaService.pasos[1].status = 3;


        this.facturaService.viewErrorFel = true;
        this.facturaService.viewError = true;
        this.facturaService.viewMessage = true;

        this.facturaService.stepMessage = this._translate.instant('pos.alertas.firmaSalioMal');

        this.saveError(resFelProcess.error);

        return;
      }


      //si todo está correcto
      this.facturaService.pasosCompletos++;
      this.facturaService.pasos[1].status = 2;
      this.facturaService.pasos[1].visible = false;


      this.facturaService.viewSucces = true;
      this.facturaService.viewMessage = true;


      this.facturaService.isStepLoading = false;

      // this.facturaService.stepMessage = "Documento creado y furmado correctamente.";


      this.printFormat();


    } else {
      //Enviar documento a tbl_documento estructura
      this.facturaService.isLoading = true;

      let resCreateDoc: TypeErrorInterface = await this.sendDocument()

      this.facturaService.isLoading = false;

      if (resCreateDoc.type == 1) {
        this.showError(resCreateDoc.error);
        return;
      }

      // if (resCreateDoc.type == 0) {
      //   this._notificationService.openSnackbar(this._translate.instant('pos.alertas.documentoCreado'));
      // }

      this.printFormat();
    }
  }

  async printFormat() {

    this.facturaService.setIdDocumentoRef();


    //TODO:Verificar tipo de documento, imprimir cotizacion alfa y omega
    // if (this.facturaService.tipoDocumento == 20) {
    //   //Generar datos apra impresion de cotizacion

    //   this.printCotizacion();
    //   return;
    // }

    this.facturaService.isLoading = true;

    let resEncabezado: ResApiInterface = await this._documentService.getEncabezados(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );

    if (!resEncabezado.status) {

      this.facturaService.isLoading = false;
      this.showError(resEncabezado);

      return;

    }

    let encabezados: EncabezadoPrintInterface[] = resEncabezado.response;

    let resDetalles: ResApiInterface = await this._documentService.getDetalles(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );

    if (!resDetalles.status) {

      this.facturaService.isLoading = false;

      this.showError(resDetalles);

      return;

    }

    let detalles: DetallePrintInterface[] = resDetalles.response;

    let resPagos: ResApiInterface = await this._documentService.getPagos(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );


    if (!resPagos.status) {

      this.facturaService.isLoading = false;

      this.showError(resPagos);

      return;

    }


    let pagos: PagoPrintInterface[] = resPagos.response;

    if (encabezados.length == 0) {

      this.facturaService.isLoading = false;

      resEncabezado.response = this._translate.instant('pos.factura.sin_encabezados');

      this.showError(resEncabezado);

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

    // let isFel: boolean = true;
    let isFel: boolean = this.facturaService.valueParametro(349);


    let fechaCert: string = "";
    let horaCert: string = "";

    if (this.dataFel) {
      let date: Date = new Date(this.dataFel.fechaHoraCertificacion);

      fechaCert = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      horaCert = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    let documento: DocumentoData = {
      consecutivo: this.consecutivoDoc,
      titulo: encabezado.tipo_Documento?.toUpperCase()!,
      descripcion: isFel ? this._translate.instant('pos.factura.fel') : this._translate.instant('pos.factura.documento_generico'),
      fechaCert: isFel ? `${fechaCert} ${horaCert}` : "",
      serie: isFel ? this.dataFel?.serieDocumento ?? "" : "",
      no: isFel ? this.dataFel?.numeroDocumento ?? "" : "",
      autorizacion: isFel ? this.dataFel?.numeroAutorizacion ?? "" : "",
      serieInterna: encabezado.serie_Documento!,
      noInterno: encabezado.iD_Documento_Ref!,
    }

    let cuenta: ClienteInterface | undefined = this.facturaService.cuenta;

    let currentDate: Date = new Date();

    let cliente: Cliente = {
      correo: cuenta?.eMail ?? "",
      nombre: cuenta?.factura_Nombre ?? "",
      direccion: cuenta?.factura_Direccion ?? "",
      nit: cuenta?.factura_NIT ?? "",
      tel: cuenta?.telefono ?? "",
      fecha: currentDate,
    }

    let fechas: Fechas = {
      fechaInicio: encabezado.fecha_Ini,
      fechaInicioRef: encabezado.ref_Fecha_Ini,
      fechaFin: encabezado.fecha_Fin,
      fechaFinRef: encabezado.ref_Fecha_Fin,
    }

    let cargo: number = 0;
    let descuento: number = 0;
    let subtotal: number = 0;
    let total: number = 0;

    let items: Item[] = [];


    //TODO:Usar transacciones de la base de datos
    detalles.forEach(detail => {



      if (detail.cantidad == 0 && detail.monto > 0) {
        //4 cargo
        cargo += detail.monto;
      } else if (detail.cantidad == 0 && detail.monto < 0) {
        //5 descuento
        descuento += detail.monto;
      } else {
        //cualquier otro
        subtotal += detail.monto;
      }

      items.push(
        {
          sku: detail.producto_Id,
          descripcion: detail.des_Producto,
          cantidad: detail.cantidad,
          unitario: this.facturaService.tipoDocumento! == 20 ? this.currencyPipe.transform(detail.cantidad > 0 ? (detail.monto / encabezado.cantidad_Dias_Fecha_Ini_Fin) / detail.cantidad : detail.monto, ' ', 'symbol', '2.2-2')! : this.currencyPipe.transform(detail.cantidad > 0 ? detail.monto! / detail.cantidad : detail.monto, ' ', 'symbol', '2.2-2')!,
          total: this.currencyPipe.transform(detail.monto, ' ', 'symbol', '2.2-2')!,
          precioDia: this.currencyPipe.transform(detail.monto, ' ', 'symbol', '2.2-2')!,
          imagen64: detail.img_Producto,
          precioRepocision: detail.precio_Reposicion ?? "00.00",
        }
      );
    });

    total += (subtotal + cargo) + descuento;

    let montos: Montos = {
      subtotal: this.currencyPipe.transform(subtotal, ' ', 'symbol', '2.2-2')!,
      cargos: this.currencyPipe.transform(cargo, ' ', 'symbol', '2.2-2')!,
      descuentos: this.currencyPipe.transform(descuento, ' ', 'symbol', '2.2-2')!,
      total: this.currencyPipe.transform(total, ' ', 'symbol', '2.2-2')!,
      totalLetras: encabezado.monto_Letras!.toUpperCase(),
    }

    let pagosP: Pago[] = [];

    pagos.forEach(pago => {

      pagosP.push(
        {
          tipoPago: pago.fDes_Tipo_Cargo_Abono,
          monto: this.currencyPipe.transform(pago.monto, ' ', 'symbol', '2.2-2')!,
          pago: this.currencyPipe.transform((pago.monto + pago.cambio), ' ', 'symbol', '2.2-2')!,
          cambio: this.currencyPipe.transform(pago.cambio, ' ', 'symbol', '2.2-2')!,
        }
      );
    });

    let vendedor: string = "";
    let emailVendedor: string = encabezado.cuenta_Correntista_Ref_EMail ??= "";
    ;

    if (this.facturaService.vendedores.length > 0) {
      vendedor = this.facturaService.vendedor!.nom_Cuenta_Correntista;
    }

    let certificador: Certificador;

    certificador = {
      nit: this.dataFel?.nitCertificador ?? '',
      nombre: this.dataFel?.nombreCertificador ?? "",
    }

    let mensajes: string[] = [
      //TODO: Mostrar frase
      // "**Sujeto a pagos trimestrales**",
      this._translate.instant('pos.factura.sin_devoluciones')
    ];

    let poweredBy: PoweredBy = {
      nombre: "Desarrollo Moderno de Software S.A.",
      website: "www.demosoft.com.gt",
    }

    let observaciones: ObservacionesRef = {
      descripcion: encabezado.ref_Descripcion ?? "",
      observacion: encabezado.ref_Observacion ?? "",
      observacion2: encabezado.ref_Observacion_2 ?? "",
      observacion3: encabezado.ref_Observacion_3 ?? "",
    }

    this.docPrint = {
      image64Empresa: this.empresa.empresa_Img,
      evento: encabezado.fDes_Tipo_Referencia ?? "",
      cantidadDias: encabezado.cantidad_Dias_Fecha_Ini_Fin,
      emailVendedor: emailVendedor,
      noDoc: encabezado.iD_Documento_Ref ?? "",
      refObservacones: observaciones,
      empresa: empresa,
      documento: documento,
      cliente: cliente,
      items: items,
      montos: montos,
      pagos: pagosP,
      vendedor: vendedor,
      certificador: certificador!,
      observacion: this.facturaService.observacion,
      mensajes: mensajes,
      poweredBy: poweredBy,
      fechas: fechas,
    }

    //Imprimir doc 
    if (this.facturaService.tipoDocumento! == 20) {
      //immmpirmir cotizacion
      this.facturaService.isLoading = false;

      const docDefinition = await this._printService.getPDFCotizacionAlfaYOmega(this.docPrint);

      pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.pdfMake.vfs).print();

      // pdfMake.createPdf(docDefinition).print();

      if (
        this.facturaService.nuevoDoc) {
        this.setValuesNewDoc();
      }

      this._notificationService.openSnackbar(`${this._translate.instant('pos.alertas.docCreado')}: ${this.consecutivoDoc}`);

      return;

    }

    const docDefinition = await this._printService.getPDFDocTMU(this.docPrint);


    if (encabezado.preview != 0) {
      // pdfMake.createPdf(docDefinition).print();
      pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.pdfMake.vfs).print();
      return;
    }


    let resService: ResApiInterface = await this._printService.getStatus();

    if (!resService.status) {

      this.facturaService.isLoading = false;

      this.printAnyway(docDefinition, this._translate.instant('pos.alertas.sin_servicio_impresion'));

      return;
    }

    // encabezado.impresora = "POS-80"

    let resPrintStatus: ResApiInterface = await this._printService.getStatusPrint(encabezado.impresora);

    if (!resPrintStatus.status) {

      this.facturaService.isLoading = false;

      this.printAnyway(docDefinition, `${this._translate.instant('pos.factura.impresora')} ${encabezado.impresora} ${this._translate.instant('pos.factura.noDisponible')}.`);

      return;
    }



    const pdfDocGenerator = pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.pdfMake.vfs);

    // return;
    pdfDocGenerator.getBlob(async (blob) => {
      // ...
      var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

      this.facturaService.isLoading = true;

      let resPrint: ResApiInterface = await this._printService.postPrint(
        pdfFile,
        encabezado.impresora,
        encabezado.copias ?? 1,
      );


      if (!resPrint.status) {

        this.facturaService.isLoading = false;

        this.printAnyway(docDefinition, this._translate.instant('pos.botones.salioMal'));

        return;

      }

      this.facturaService.isLoading = false;

      if (
        this.facturaService.nuevoDoc) {

        this.setValuesNewDoc();

      }
      this._notificationService.openSnackbar(`${this._translate.instant('pos.alertas.docCreado')}: ${this.consecutivoDoc}`);
      // this._notificationService.openSnackbar(this._translate.instant('pos.factura.documento_procesado'));

    });


  }

  async printAnyway(doc: TDocumentDefinitions, descripcion: string) {

    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.falloImpresion'),
        description: descripcion,
        verdadero: this._translate.instant('pos.alertas.imprimirOtroMetodo'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (this.facturaService.nuevoDoc) {
      this.setValuesNewDoc();
    }

    this._notificationService.openSnackbar(`${this._translate.instant('pos.alertas.docCreado')}: ${this.consecutivoDoc}`);

    if (!verificador) return;

    pdfMake.createPdf(doc, undefined, undefined, pdfFonts.pdfMake.vfs).print();
    // pdfMake.createPdf(doc).print();



  }

  async retryFel() {

    //cargar paso en pantalla d carga
    this.facturaService.pasos[1].visible = true;
    this.facturaService.pasos[1].status = 1;


    //Empezar proceso FEL 
    let resFelProcess: TypeErrorInterface = await this.felProcess();


    //evaluar respuesta proceso fel 
    if (resFelProcess.type == 1) {

      //No se completo el proceso fel
      this.facturaService.pasos[1].visible = false;
      this.facturaService.pasos[1].status = 3;


      this.facturaService.viewErrorFel = true;
      this.facturaService.viewError = true;
      this.facturaService.viewMessage = true;

      this.facturaService.stepMessage = this._translate.instant('pos.botones.firmaSalioMal');

      this.saveError(resFelProcess.error);


      return;
    }


    //si todo está correcto
    this.facturaService.pasosCompletos++;
    this.facturaService.pasos[1].status = 2;
    this.facturaService.pasos[1].visible = false;


    this.facturaService.viewSucces = true;
    this.facturaService.viewMessage = true;


    this.facturaService.isStepLoading = false;

    // this.facturaService.stepMessage = "Documento creado y furmado correctamente.";

    this.printFormat();

  }


  async felProcess(): Promise<TypeErrorInterface> {

    //TODO:Asigna id del api en base de datos, el api es un maestr generico que devuleve cualquier token
    // let apiToken: number = 0;
    // let tokenFel: string = "";

    this.dataFel = undefined;

    //TODO:Replece for value in database
    let uuidDoc = ''

    //TODO:Asiganr el api 
    let apiUse: string = "";

    //TODO:Reemplzar y parametrizar
    let certificador: number = 1;


    //buscar documento, plantilla xml

    let resXMlCert: ResApiInterface = await this._felService.getDocXmlCert(
      this.user,
      this.token,
      this.consecutivoDoc,
    )

    if (!resXMlCert.status) {

      let error: TypeErrorInterface = {
        error: resXMlCert,
        type: 1,
      }

      return error;
    }

    let templatesXMl: DocXMLInterface[] = resXMlCert.response;

    if (templatesXMl.length == 0) {

      resXMlCert.response = "No se pudo encontrar el docuemnto xml para certificar.";

      let error: TypeErrorInterface = {
        error: resXMlCert,
        type: 1,
      }

      return error;
    }

    uuidDoc = templatesXMl[0].d_Id_Unc;
    // uuidDoc = "9CD5BF5A-CD69-4D4D-A37D-1F8979BD2835";

    //buscar las credenciales del certificador
    let resCredenciales: ResApiInterface = await this._felService.getCredenciales(
      certificador,
      this.empresa.empresa,
      this.user,
      this.token,
    )

    if (!resCredenciales.status) {

      let error: TypeErrorInterface = {
        error: resCredenciales,
        type: 1,
      }
      return error;
    }

    //TODO:Api que se va a usar debe buscarse y asignarse aqui 
    let credecniales: CredencialInterface[] = resCredenciales.response;

    for (let i = 0; i < credecniales.length; i++) {
      const element = credecniales[i];

      if (element.campo_Nombre == "apiUnificadaInfile") {

        apiUse = element.campo_Valor;
        break;
      }
    }

    if (!apiUse) {

      resCredenciales.response = "No se pudo enonctrar el servicio para procesar el documento, verifica que la configuracion de credendiales y api cataloog esté correcta";

      let error: TypeErrorInterface = {
        error: resCredenciales,
        type: 1,
      }

      return error;
    }

    //Buscvar credenciales de infile
    let llaveApi: string = "";
    let llaveFirma: string = "";
    let usuarioApi: string = "";
    let usuarioFirma: string = "";

    for (let i = 0; i < credecniales.length; i++) {
      const element = credecniales[i];

      switch (element.campo_Nombre) {
        case "LlaveApi":
          llaveApi = element.campo_Valor;

          break;
        case "LlaveFirma":
          llaveFirma = element.campo_Valor;
          break;

        case "UsuarioApi":
          usuarioApi = element.campo_Valor;
          break;
        case "UsuarioFirma":
          usuarioFirma = element.campo_Valor;
          break;
        default:
          break;
      }

    }

    let paramFel: DataInfileInterface = {
      docXML: templatesXMl[0].xml_Contenido,
      //   docXML: `<dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" Version="0.1">
      //   <dte:SAT ClaseDocumento="dte">
      //     <dte:DTE ID="DatosCertificados">
      //       <dte:DatosEmision ID="DatosEmision">
      //         <dte:DatosGenerales CodigoMoneda="GTQ" FechaHoraEmision="2024-05-28T02:53:51.000-06:00" Tipo="FCAM" />
      //         <dte:Emisor AfiliacionIVA="GEN" CodigoEstablecimiento="1" CorreoEmisor="" NITEmisor="9300000118K" NombreComercial="TEXAS MUEBLES Y MAS" NombreEmisor="CORPORACION NR, SOCIEDAD ANONIMA">
      //           <dte:DireccionEmisor>
      //             <dte:Direccion>4 AVENIDA 5-99 ZONA 1</dte:Direccion>
      //             <dte:CodigoPostal>010020</dte:CodigoPostal>
      //             <dte:Municipio>SANTA LUCIA COTZULMALGUAPA</dte:Municipio>
      //             <dte:Departamento>ESCUINTLA</dte:Departamento>
      //             <dte:Pais>GT</dte:Pais>
      //           </dte:DireccionEmisor>
      //         </dte:Emisor>
      //         <dte:Receptor CorreoReceptor="" IDReceptor="2768220480502" NombreReceptor="MELVIN DANIEL ,SOMA MÉNDEZ" TipoEspecial="CUI">
      //           <dte:DireccionReceptor>
      //             <dte:Direccion>Ciudad</dte:Direccion>
      //             <dte:CodigoPostal>01007</dte:CodigoPostal>
      //             <dte:Municipio>Guatemala</dte:Municipio>
      //             <dte:Departamento>Guatemala</dte:Departamento>
      //             <dte:Pais>GT</dte:Pais>
      //           </dte:DireccionReceptor>
      //         </dte:Receptor>
      //         <dte:Frases>
      //           <dte:Frase CodigoEscenario="1" TipoFrase="1" />
      //         </dte:Frases>
      //         <dte:Items>
      //           <dte:Item NumeroLinea="1" BienOServicio="B">
      //             <dte:Cantidad>1.0000</dte:Cantidad>
      //             <dte:UnidadMedida>UND</dte:UnidadMedida>
      //             <dte:Descripcion>457224|TELEFONO SAMSUNG GALAXY A34 457224RFCWA0SDV8Y     IMEI1: 350350681547282 IMEI2:351525681547288</dte:Descripcion>
      //             <dte:PrecioUnitario>2200.0000</dte:PrecioUnitario>
      //             <dte:Precio>2200.0000</dte:Precio>
      //             <dte:Descuento>0</dte:Descuento>
      //             <dte:Impuestos>
      //               <dte:Impuesto>
      //                 <dte:NombreCorto>IVA</dte:NombreCorto>
      //                 <dte:CodigoUnidadGravable>1</dte:CodigoUnidadGravable>
      //                 <dte:MontoGravable>1964.29</dte:MontoGravable>
      //                 <dte:MontoImpuesto>235.7143</dte:MontoImpuesto>
      //               </dte:Impuesto>
      //             </dte:Impuestos>
      //             <dte:Total>2200.0000</dte:Total>
      //           </dte:Item>
      //         </dte:Items>
      //         <dte:Totales>
      //           <dte:TotalImpuestos>
      //             <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="235.7143" />
      //           </dte:TotalImpuestos>
      //           <dte:GranTotal>2200.0000</dte:GranTotal>
      //         </dte:Totales>
      //         <dte:Complementos>
      //           <dte:Complemento IDComplemento="Cambiaria" NombreComplemento="Cambiaria" URIComplemento="http://www.sat.gob.gt/fel/cambiaria.xsd">
      //             <cfc:AbonosFacturaCambiaria xmlns:cfc="http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0" Version="1">
      //               <cfc:Abono>
      //                 <cfc:NumeroAbono>1</cfc:NumeroAbono>
      //                 <cfc:FechaVencimiento>2024-03-29</cfc:FechaVencimiento>
      //                 <cfc:MontoAbono>2200.00</cfc:MontoAbono>
      //               </cfc:Abono>
      //             </cfc:AbonosFacturaCambiaria>
      //           </dte:Complemento>
      //         </dte:Complementos>
      //       </dte:DatosEmision>
      //     </dte:DTE>
      //   </dte:SAT>
      // </dte:GTDocumento>`,
      identificador: uuidDoc,
      llaveApi: llaveApi,
      llaveFirma: llaveFirma,
      usuarioApi: usuarioApi,
      usuarioFirma: usuarioFirma,
    }


    let resCertDoc: ResApiInterface = await this._felService.postInfile(
      apiUse,
      paramFel,
      this.token,
    )

    if (!resCertDoc.status) {

      let error: TypeErrorInterface = {
        error: resCertDoc,
        type: 1,
      }

      return error;
    }

    let doc: any = resCertDoc.response;

    let paramUpdate: ParamUpdateXMLInterface = {
      documento: doc,
      documentoCompleto: doc,
      usuario: this.user,
      uuid: uuidDoc,
    }

    //actualizar odcumento con firma
    let resUpdateXml: ResApiInterface = await this._felService.postXmlUpdate(
      this.token,
      paramUpdate,
    )

    if (!resUpdateXml.status) {

      let error: TypeErrorInterface = {
        error: resUpdateXml,
        type: 1,
      }

      return error;
    }



    let datFel: DataFelInterface[] = resUpdateXml.response;

    if (datFel.length != 0) {
      this.dataFel = datFel[0];

      //actualizar doc esrctiura

      let fechaAnt: Date = new Date(this.dataFel.fechaHoraCertificacion);


      let strDate: string = `${fechaAnt.getDate()}/${fechaAnt.getMonth() + 1}/${fechaAnt.getFullYear()} ${fechaAnt.getHours()}:${fechaAnt.getMinutes()}:${fechaAnt.getSeconds()}`

      this.docGlobal!.Doc_FEL_Serie = this.dataFel.serieDocumento;
      this.docGlobal!.Doc_FEL_UUID = this.dataFel.numeroAutorizacion;
      this.docGlobal!.Doc_FEL_fechaCertificacion = strDate;
      this.docGlobal!.Doc_FEL_numeroDocumento = this.dataFel.numeroDocumento;

      //onjeto para el api
      let document: PostDocumentInterface = {
        estado: 11,
        estructura: JSON.stringify(this.docGlobal),
        user: this.user,
      }

      let resUpdateEstructura: ResApiInterface = await this._documentService.updateDocument(
        this.token,
        document,
        this.consecutivoDoc,
      );

      //TODO:Mensjaje de error
      if (!resUpdateEstructura.status) {
        console.error("No se pudo actalizar documento estructura", resUpdateEstructura);
      }
    }

    let error: TypeErrorInterface = {
      error: resUpdateXml,
      type: 0,
    }

    return error;
  }

  //errro 1: error de api
  //error 2: error inerno
  //error 0: correcto
  //Creacion del documnto en tbl_documento estructura
  async sendDocument(): Promise<TypeErrorInterface> {
    this.docGlobal = undefined;
    this.dataFel = undefined;
    this.consecutivoDoc = -1;


    let serie: string = this.facturaService.serie!.serie_Documento; //serie de la sesion


    // Generar dos números aleatorios de 7 dígitos cada uno?


    let randomNumber1: number = Math.floor(Math.random() * 900) + 100;

    // Combinar los dos números para formar uno de 14 dígitos

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
              D_Consecutivo_Interno: randomNumber1,
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
              Tra_Monto_Dias: null,
            }
          );

        }

        //Agregar descuentos
        if (operacion.descuento < 0) {

          //aumnetar id de la transaccion
          consecutivo++;

          descuentos.push(
            {
              D_Consecutivo_Interno: randomNumber1,
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
              Tra_Monto_Dias: null,

            }
          );
        }

      });

      //agregar transacion (que no sea cargo o descuento)
      transacciones.push(
        {
          D_Consecutivo_Interno: randomNumber1,
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
          Tra_Monto: transaccion.total,
          Tra_Monto_Dias: transaccion.precioDia,
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


    let consecutivoPago: number = 1;

    //agreagar cargo abono a la estructrura
    this.facturaService.montos.forEach(monto => {
      pagos.push(
        {
          Consecutivo_Interno: consecutivoPago,
          D_Consecutivo_Interno: randomNumber1,
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
      consecutivoPago++;
    });



    //total cargo abono
    let totalCA: number = 0;

    this.facturaService.montos.forEach(monto => {
      totalCA += monto.amount;
    });


    //Obtener fecha y hora actual
    let currentDate: Date = new Date();


    //Solucion para que las horas sean correctas
    //Modificar la hora segun la diferencia horaria 
    let fEntrega: Date = this.facturaService.fechaRefIni!;
    let fRecoger: Date = this.facturaService.fechaRefFin!;
    let fIni: Date = this.facturaService.fechaIni!;
    let fFin: Date = this.facturaService.fechaFin!;

    let diferenciaHoraria: number = fEntrega.getTimezoneOffset() / 60;


    if (diferenciaHoraria > 0) {
      //es positivo
      fEntrega.setHours(this.facturaService.fechaRefIni!.getHours() - diferenciaHoraria);
      fRecoger.setHours(this.facturaService.fechaRefFin!.getHours() - diferenciaHoraria);
      fIni.setHours(this.facturaService.fechaIni!.getHours() - diferenciaHoraria);
      fFin.setHours(this.facturaService.fechaFin!.getHours() - diferenciaHoraria);
    } else {
      fEntrega.setHours(this.facturaService.fechaRefIni!.getHours() + diferenciaHoraria)
      fRecoger.setHours(this.facturaService.fechaRefFin!.getHours() + diferenciaHoraria)
      fIni.setHours(this.facturaService.fechaIni!.getHours() + diferenciaHoraria)
      fFin.setHours(this.facturaService.fechaFin!.getHours() + diferenciaHoraria)
    }



    //documento estructura
    this.docGlobal = {
      Doc_Confirmar_Orden: this.facturaService.valueParametro(58) ? this.facturaService.confirmarCotizacion : true,
      Consecutivo_Interno: randomNumber1,
      Doc_Ref_Tipo_Referencia: this.facturaService.valueParametro(58) ? this.facturaService.tipoReferencia?.tipo_Referencia : null,
      Doc_Ref_Fecha_Ini: this.facturaService.valueParametro(381) ? fEntrega : null,
      Doc_Ref_Fecha_Fin: this.facturaService.valueParametro(382) ? fRecoger : null,
      Doc_Fecha_Ini: this.facturaService.valueParametro(44) ? fIni : null,
      Doc_Fecha_Fin: this.facturaService.valueParametro(44) ? fFin : null,
      Doc_Ref_Observacion_2: this.facturaService.valueParametro(385) ? this.facturaService.refContacto : null,
      Doc_Ref_Descripcion: this.facturaService.valueParametro(383) ? this.facturaService.refDescripcion : null,
      Doc_Ref_Observacion_3: this.facturaService.valueParametro(386) ? this.facturaService.refDireccionEntrega : null,
      Doc_Ref_Observacion: this.facturaService.valueParametro(384) ? this.facturaService.refObservacion : null,
      Doc_Tra_Monto: this.facturaService.total,
      Doc_CA_Monto: totalCA,
      Doc_ID_Certificador: 1, //TODO:Parametrizar
      Doc_Cuenta_Correntista_Ref: this.facturaService.vendedor?.cuenta_Correntista ?? null,
      Doc_ID_Documento_Ref: this.facturaService.idDocumentoRef,
      Doc_FEL_numeroDocumento: null,
      Doc_FEL_Serie: null,
      Doc_FEL_UUID: null,
      Doc_FEL_fechaCertificacion: null,
      Doc_Fecha_Documento: currentDate.toISOString(),
      Doc_Cuenta_Correntista: this.facturaService.cuenta!.cuenta_Correntista,
      Doc_Cuenta_Cta: this.facturaService.cuenta!.cuenta_Cta,
      Doc_Tipo_Documento: this.tipoDocumento!,
      Doc_Serie_Documento: serie,
      Doc_Empresa: this.empresa.empresa,
      Doc_Estacion_Trabajo: this.estacion.estacion_Trabajo,
      Doc_UserName: this.user,
      Doc_Observacion_1: this.facturaService.observacion,
      Doc_Tipo_Pago: 1, //TODO:preguntar
      Doc_Elemento_Asignado: 1, //TODO:Preguntar
      Doc_Transaccion: transacciones,
      Doc_Cargo_Abono: pagos,
    }

    //onjeto para el api
    let document: PostDocumentInterface = {
      estructura: JSON.stringify(this.docGlobal),
      user: this.user,
      estado: this.facturaService.valueParametro(349) ? 1 : 11,
    }

    //consumo del servico para crear el documento
    let resDoc = await this._documentService.postDocument(this.token, document);

    //Si algo salió mal mostrar error
    if (!resDoc.status) {

      let error: TypeErrorInterface = {
        error: resDoc,
        type: 1,
      }

      return error;

    }

    this.consecutivoDoc = resDoc.response.data;

    //Si todo está correcto mostrar alerta

    let error: TypeErrorInterface = {
      error: this.consecutivoDoc,
      type: 0,
    }

    return error;
  }

  async modifyDoc() {

    if (this.facturaService.valueParametro(58)) {
      if (!this.facturaService.tipoReferencia) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.seleccioneTipoRef'));
        return;
      }
    }

    //confrumar cambio
    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.aplicaranCambios'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    const partesFecha = this.globalConvertService.docOriginSelect!.fecha_Documento.toString().split('/');
    const dia = partesFecha[0];
    const mes = partesFecha[1];
    const anio = partesFecha[2];

    // Crea un objeto Date con el formato esperado ('YYYY-MM-DD')
    const fechaFormateada = new Date(`${anio}-${mes}-${dia}`);

    // Actualizar documento (ewncabezados)
    let docModify: UpdateDocInterface = {
      consecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
      cuentaCorrentista: this.facturaService.cuenta!.cuenta_Correntista,
      cuentaCorrentistaRef: this.facturaService.vendedor?.cuenta_Correntista,
      cuentaCuenta: this.facturaService.cuenta!.cuenta_Cta,
      documentoDireccion: this.facturaService.cuenta!.factura_Direccion,
      documentoNit: this.facturaService.cuenta!.factura_NIT,
      documentoNombre: this.facturaService.cuenta!.factura_Nombre,
      empresa: this.globalConvertService.docOriginSelect!.empresa,
      estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
      fechaDocumento: fechaFormateada,
      fechaFin: this.facturaService.fechaFin,
      fechaHora: this.globalConvertService.docOriginSelect!.fecha_Hora,
      fechaIni: this.facturaService.fechaIni,
      idDocumento: this.globalConvertService.docOriginSelect!.iD_Documento.toString(),
      localizacion: this.globalConvertService.docOriginSelect!.localizacion,
      mUser: this.user,
      observacion: this.facturaService.observacion,
      referencia: this.facturaService.tipoReferencia?.tipo_Referencia,
      serieDocumento: this.globalConvertService.docOriginSelect!.serie_Documento,
      tipoDocumento: this.globalConvertService.docOriginSelect!.tipo_Documento,
      user: this.globalConvertService.docOriginSelect!.usuario,
    }

    this.facturaService.isLoading = true;
    let resUpdateEncabezado: ResApiInterface = await this._recpetionService.updateDocument(
      this.token,
      docModify,
    );

    if (!resUpdateEncabezado.status) {
      this.facturaService.isLoading = false;

      this.showError(resUpdateEncabezado);

      return;
    }

    let refModify: UpdateRefInterface = {
      descripcion: this.facturaService.refDescripcion ?? "",
      empresa: this.globalConvertService.docOriginSelect!.empresa,
      fechaFin: this.facturaService.fechaRefFin!,
      fechaIni: this.facturaService.fechaRefIni!,
      mUser: this.user,
      observacion: this.facturaService.refObservacion ?? "",
      observacion2: this.facturaService.refContacto ?? "",
      observacion3: this.facturaService.refDireccionEntrega ?? "",
      referencia: this.globalConvertService.docOriginSelect!.referencia!,
      referenciaID: '92144684365752',//TODO:Preguntar
      tipoReferencia: this.facturaService.tipoReferencia?.tipo_Referencia ?? null,
    }

    let resRefUpdate: ResApiInterface = await this._recpetionService.updateRef(
      this.token,
      refModify,
    );

    if (!resRefUpdate.status) {
      this.facturaService.isLoading = false;
      this.showError(resRefUpdate);
      return;
    }

    //eliminar transacciones
    for (const eliminar of this.facturaService.transaccionesPorEliminar) {

      let transactionEliminar: NewTransactionInterface = {
        bodega: eliminar.bodega!.bodega,
        cantidad: eliminar.cantidad!,
        documentoConsecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
        empresa: this.globalConvertService.docOriginSelect!.empresa,
        estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
        localizacion: this.globalConvertService.docOriginSelect!.localizacion,
        moneda: eliminar.precio!.moneda,
        monto: eliminar.total,
        montoMoneda: eliminar.total / this.tipoCambio,
        producto: eliminar.producto.producto,
        tipoCambio: this.tipoCambio,
        tipoPrecio: eliminar.precio!.id,
        tipoTransaccion: this.facturaService.resolveTipoTransaccion(eliminar.producto.tipo_Producto),
        transaccionConsecutivoInterno: eliminar.consecutivo,
        unidadMedida: eliminar.producto.unidad_Medida,
        usuario: this.user,
      }


      let resTransDelete: ResApiInterface = await this._recpetionService.anularTransaccion(
        this.token,
        transactionEliminar,
      );

      if (!resTransDelete.status) {

        this.facturaService.isLoading = false;

        this.showError(resTransDelete);

        return;
      }
    }

    //lipiar lista de eliminados
    this.facturaService.transaccionesPorEliminar = [];

    let indexUpdate: number = 0;
    //Actualizar transacciones
    for (const actualizar of this.facturaService.traInternas) {

      if (actualizar.estadoTra != 0 && actualizar.consecutivo != 0) {

        ///Anular y actualizar
        let transactionActualizar: NewTransactionInterface = {
          bodega: actualizar.bodega!.bodega,
          cantidad: actualizar.cantidad!,
          documentoConsecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
          empresa: this.globalConvertService.docOriginSelect!.empresa,
          estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
          localizacion: this.globalConvertService.docOriginSelect!.localizacion,
          moneda: actualizar.precio!.moneda,
          monto: actualizar.total,
          montoMoneda: actualizar.total / this.tipoCambio,
          producto: actualizar.producto.producto,
          tipoCambio: this.tipoCambio,
          tipoPrecio: actualizar.precio!.id,
          tipoTransaccion: this.facturaService.resolveTipoTransaccion(actualizar.producto.tipo_Producto),
          transaccionConsecutivoInterno: actualizar.consecutivo,
          unidadMedida: actualizar.producto.unidad_Medida,
          usuario: this.user,
        }


        let resTransDelete: ResApiInterface = await this._recpetionService.anularTransaccion(
          this.token,
          transactionActualizar,
        );


        if (!resTransDelete.status) {

          this.facturaService.isLoading = false;

          this.showError(resTransDelete);

          return;

        }

        let resActualizarTransaccion: ResApiInterface = await this._recpetionService.insertarTransaccion(
          this.token,
          transactionActualizar,
        );

        if (!resActualizarTransaccion.status) {

          this.facturaService.isLoading = false;

          this.showError(resActualizarTransaccion);

          return;

        }

        this.facturaService.traInternas[indexUpdate].consecutivo = resActualizarTransaccion.response;
        indexUpdate++;
      }
    }

    let indexInsert: number = 0;
    //insertar tranasacciones
    for (const nueva of this.facturaService.traInternas) {

      if (nueva.estadoTra != 0 && nueva.consecutivo == 0) {
        ///Nueva transaccion
        let transactionNueva: NewTransactionInterface = {
          bodega: nueva.bodega!.bodega,
          cantidad: nueva.cantidad!,
          documentoConsecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
          empresa: this.globalConvertService.docOriginSelect!.empresa,
          estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
          localizacion: this.globalConvertService.docOriginSelect!.localizacion,
          moneda: nueva.precio!.moneda,
          monto: nueva.total,
          montoMoneda: nueva.total / this.tipoCambio,
          producto: nueva.producto.producto,
          tipoCambio: this.tipoCambio,
          tipoPrecio: nueva.precio!.id,
          tipoTransaccion: this.facturaService.resolveTipoTransaccion(nueva.producto.tipo_Producto),
          transaccionConsecutivoInterno: nueva.consecutivo,
          unidadMedida: nueva.producto.unidad_Medida,
          usuario: this.user,
        }

        let resActualizarTransaccion: ResApiInterface = await this._recpetionService.insertarTransaccion(
          this.token,
          transactionNueva,
        );

        if (!resActualizarTransaccion.status) {

          this.facturaService.isLoading = false;

          this.showError(resActualizarTransaccion);

          return;

        }

        this.facturaService.traInternas[indexInsert].consecutivo = resActualizarTransaccion.response;
        indexInsert++;

      }
    }

    this.facturaService.isLoading = false;
    this._notificationService.openSnackbar(this._translate.instant('pos.alertas.docEditado'));
  }

  async showError(res: ResApiInterface) {
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    this.verError(res);
  }

  saveError(res: ResApiInterface) {
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
  }


  verPasos() {
    this.facturaService.verError = false;
    this.facturaService.isStepLoading = true;
  }

  // Función para manejar el cambio de estado del switch
  switchFel(): void {
    this.dataUserService.switchState = !this.dataUserService.switchState;

    //falso es 0
    if (this.dataUserService.switchState == false) {
      PreferencesService.sitchFelStorage = "0"
    }

    if (this.dataUserService.switchState == true) {
      //verdadero es 1
      PreferencesService.sitchFelStorage = "1"
    }
  }

}
