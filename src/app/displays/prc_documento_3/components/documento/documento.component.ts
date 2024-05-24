import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { MatDialog } from '@angular/material/dialog';
import { ClientesEncontradosComponent } from '../clientes-encontrados/clientes-encontrados.component';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaService } from '../../services/cuenta.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { ParametroService } from '../../services/parametro.service';
import { PagoService } from '../../services/pago.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ProductService } from '../../services/product.service';
import { ReferenciaService } from '../../services/referencia.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PrecioDiaInterface } from '../../interfaces/precio-dia.interface';

@Component({
  selector: 'app-documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.scss'],
  providers: [
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
    ReferenciaService,
  ]
})
export class DocumentoComponent implements OnInit, OnDestroy {
  //abrir selectores de horas
  @ViewChild('horaRefIni') horaRefIni: any;
  @ViewChild('horaRefFin') horaRefFin: any;
  @ViewChild('horaIni') horaIni: any;
  @ViewChild('horaFin') horaFin: any;

  private controlSubFechaRefIni: Subscription | undefined;
  private controlSubFechaRefFin: Subscription | undefined;
  private controlSubFechaIni: Subscription | undefined;
  private controlSubFechaFin: Subscription | undefined;



  @Output() newItemEvent = new EventEmitter<string>();

  switchState: boolean = false;

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;



  constructor(
    private _dialog: MatDialog,
    private _translate: TranslateService,
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _cuentaService: CuentaService,
    private _notificationService: NotificationsService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
    public globalConvertService: GlobalConvertService,
    private _productService: ProductService,
    private _referenciaService: ReferenciaService,
  ) {

  }
  ngOnDestroy(): void {
    if (this.controlSubFechaRefIni)
      this.controlSubFechaRefIni.unsubscribe();

    if (this.controlSubFechaRefFin)
      this.controlSubFechaRefFin.unsubscribe();

    if (this.controlSubFechaIni)
      this.controlSubFechaIni.unsubscribe();

    if (this.controlSubFechaFin)
      this.controlSubFechaFin.unsubscribe();

  }



  ngOnInit(): void {
    this.controlSubFechaRefIni = this.facturaService.formControlHoraRefIni.valueChanges.subscribe(valor => {
      this.setDateRefIni();
    });

    this.controlSubFechaRefFin = this.facturaService.formControlHoraRefFin.valueChanges.subscribe(valor => {
      this.setDateRefFin();
    });

    this.controlSubFechaIni = this.facturaService.formControlHoraIni.valueChanges.subscribe(valor => {
      this.setDateIni();
    });

    this.controlSubFechaFin = this.facturaService.formControlHoraFin.valueChanges.subscribe(valor => {
      this.setDateFin();
    });

    this.formatoFecha();
  }

  convertValidDate(date: NgbDateStruct, timeString: string): Date {
    // Separar la cadena de tiempo en horas, minutos y AM/PM
    const { year, month, day } = date;
    const [time, meridiem] = timeString.split(' ');
    const [hoursString, minutesString] = time.split(':');

    let hours = parseInt(hoursString);
    const minutes = parseInt(minutesString);

    // Convertir las horas a formato de 24 horas si es PM
    if (meridiem.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
      hours = 0; // Si es 12:xx AM, lo convertimos a 0 horas
    }

    return new Date(year, month - 1, day, hours, minutes);
  }

  //formatear la hora con una fecha ingresada.
  getHoraInput(horaSelected: Date): string {
    // Obtener la hora actual y formatearla como deseas
    let hora = new Date(horaSelected);
    let horas = hora.getHours();
    let minutos = hora.getMinutes();
    let ampm = horas >= 12 ? 'pm' : 'am';
    // Formatear la hora actual como 'hh:mm am/pm'
    return `${horas % 12 || 12}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`;
  };


  //funciones para el fotmato de las fechas

  formatDate(date: NgbDateStruct): string {
    return `${this.padZero(date.day)}-${this.padZero(date.month)}-${date.year}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  //cargar los textos de las fechas
  formatoFecha() {

    if (this.facturaService.inputFechaRefIni) {
      this.facturaService.fechaRefInicialFormat = this.formatDate(this.facturaService.inputFechaRefIni);
    }

    if (this.facturaService.inputFechaRefFin) {
      this.facturaService.fechaRefFinalFormat = this.formatDate(this.facturaService.inputFechaRefFin);
    }

    if (this.facturaService.inputFechaIni) {
      this.facturaService.fechaInicialFormat = this.formatDate(this.facturaService.inputFechaIni);
    }

    if (this.facturaService.inputFechaFinal) {
      this.facturaService.fechaFinalFormat = this.formatDate(this.facturaService.inputFechaFinal);
    }

  }

  fechaIni(date: NgbDateStruct) {
    this.facturaService.fechaInicialFormat = this.formatDate(date);
    this.facturaService.inputFechaIni = date;
    this.setDateIni();
  }

  fechaFin(date: NgbDateStruct) {
    this.facturaService.fechaFinalFormat = this.formatDate(date);
    this.facturaService.inputFechaFinal = date;
    this.setDateFin();
  }

  fechaIniRef(date: NgbDateStruct) {
    this.facturaService.fechaRefInicialFormat = this.formatDate(date);
    this.facturaService.inputFechaRefIni = date;

    this.setDateRefIni();
  }

  fechaFinRef(date: NgbDateStruct) {
    this.facturaService.fechaRefFinalFormat = this.formatDate(date);
    this.facturaService.inputFechaRefFin = date;

    this.setDateRefFin();
  }

  copyDates() {
    this.facturaService.copyFechaRefIni = new Date(this.facturaService.fechaRefIni!);
    this.facturaService.copyFechaRefFin = new Date(this.facturaService.fechaRefFin!);
    this.facturaService.copyFechaIni = new Date(this.facturaService.fechaIni!);
    this.facturaService.copyFechaFin = new Date(this.facturaService.fechaFin!);
  }

  restartDateFin() {

    this.facturaService.fechaFin = new Date(this.facturaService.copyFechaFin!);

    // Inicializar selectedDate con la fecha de hoy
    this.facturaService.inputFechaFinal = UtilitiesService.getStructureDate(this.facturaService.fechaFin);


    this.facturaService.formControlHoraFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaFin));

  }

  restartDateRefIni() {
    this.facturaService.fechaRefIni = new Date(this.facturaService.copyFechaRefIni!);
    this.facturaService.inputFechaRefIni = UtilitiesService.getStructureDate(this.facturaService.fechaRefIni);
    this.facturaService.formControlHoraRefIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefIni));



  }


  restartDateRefFin() {
    this.facturaService.fechaRefFin = new Date(this.facturaService.copyFechaRefFin!);
    this.facturaService.inputFechaRefFin = UtilitiesService.getStructureDate(this.facturaService.fechaRefFin);
    this.facturaService.formControlHoraRefFin.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaRefFin));

  }


  restartDateIni() {
    this.facturaService.fechaIni = new Date(this.facturaService.copyFechaIni!);
    this.facturaService.inputFechaIni = UtilitiesService.getStructureDate(this.facturaService.fechaIni);
    this.facturaService.formControlHoraIni.setValue(UtilitiesService.getHoraInput(this.facturaService.fechaIni));

  }


  setDateRefIni() {

    this.facturaService.fechaRefIni = this.convertValidDate(this.facturaService.inputFechaRefIni!, this.facturaService.formControlHoraRefIni.value);

    if (UtilitiesService.minorDateWithoutSeconds(this.facturaService.fechaRefIni, this.facturaService.fecha!)) {

      //TODO:Translate
      this._notificationService.openSnackbar(`${this.facturaService.getTextParam(381)} debe ser mayor a la fecha y hora actual.`);
      this.restartDateRefIni();
      return;
    }

    //Copiar valores
    this.copyDates();

    this.facturaService.saveDocLocal()

  }


  setDateRefFin() {

    this.facturaService.fechaRefFin = this.convertValidDate(this.facturaService.inputFechaRefFin!, this.facturaService.formControlHoraRefFin.value);

    //validaciones para la fehca fin ref

    if (UtilitiesService.minorDateWithoutSeconds(this.facturaService.fechaRefFin, this.facturaService.fechaRefIni!)) {
      //TODO:Translate
      this._notificationService.openSnackbar(`${this.facturaService.getTextParam(382)} debe ser mayor a ${this.facturaService.getTextParam(381)}.`);
      this.restartDateRefFin();
      return;
    }

    //Copiar valores
    this.copyDates();

    this.facturaService.saveDocLocal()

  }


  async setDateIni() {
    this.facturaService.fechaIni = this.convertValidDate(this.facturaService.inputFechaIni!, this.facturaService.formControlHoraIni.value);

    //Validaciones para la fehca inicio

    if (UtilitiesService.minorDateWithoutSeconds(this.facturaService.fechaIni, this.facturaService.fechaRefIni!)) {
      //TODO:Translate
      this._notificationService.openSnackbar(`Fecha inicio debe ser mayor a ${this.facturaService.getTextParam(381)}.`);
      this.restartDateIni();
      return;
    }


    if (this.facturaService.fechaIni > this.facturaService.fechaFin!) {
      //TODO:Translate
      this._notificationService.openSnackbar(`Fecha inicio debe ser menor a fecha fin.`);
      this.restartDateIni();
      return;
    }

    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(351)) {
      //si hay productos agregados no se puede cambiar la fechha
      if (this.facturaService.traInternas.length > 0) {
        //TODO:Translate

        let verificador: boolean = await this._notificationService.openDialogActions(
          {
            title: this._translate.instant('¿Cambiar fecha?'),
            description: this._translate.instant("El total del precio por día de las transacciones agregadas al documento volverá a calcularse en base a la nueva fecha ingresada."),
            verdadero: this._translate.instant('pos.botones.aceptar'),
            falso: this._translate.instant('pos.botones.cancelar'),
          }
        );

        if (!verificador) {
          this.restartDateIni();
          return;
        };


        //Calcular nuevos totales
        if (this.facturaService.valueParametro(351)) {

          for (const tra of this.facturaService.traInternas) {
            let count: number = 0;


            this.facturaService.isLoading = true;

            let res: ResApiInterface = await this._productService.getFormulaPrecioU(
              this.token,
              this.facturaService.fechaIni,
              this.facturaService.fechaFin!,
              tra.precioCantidad!.toString(),
            );

            this.facturaService.isLoading = false;

            if (!res.status) {
              this._notificationService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

              console.error(res);

              return;
            }

            let calculoDias: PrecioDiaInterface[] = res.response;

            if (calculoDias.length == 0) {


              res.response = "No se están obteiiendo valores del procedimiento almacenado"

              this._notificationService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

              console.error(res);

              return;
            }

            this.facturaService.traInternas[count].precioDia = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].total = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].cantidadDias = calculoDias[0].catidad_Dia;


            count++;

          }

          this.facturaService.calculateTotales();
        }
      }
    }

    //Copiar valores
    this.facturaService.copyFechaIni = new Date(this.facturaService.fechaIni!);
    this.facturaService.copyFechaFin = new Date(this.facturaService.fechaFin!);

    this.facturaService.saveDocLocal()

  }

  async setDateFin() {
    this.facturaService.fechaFin = this.convertValidDate(this.facturaService.inputFechaFinal!, this.facturaService.formControlHoraFin.value);


    //vañidaciones para la fecha fin
    if (UtilitiesService.minorDateWithoutSeconds(this.facturaService.fechaFin, this.facturaService.fechaIni!)) {
      //TODO:Translate
      this._notificationService.openSnackbar(`Fecha fin debe ser mayor a fecha inicio.`);
      this.restartDateFin();
      return;
    }

    if (this.facturaService.fechaFin > this.facturaService.fechaRefFin!) {
      //TODO:Translate
      this._notificationService.openSnackbar(`Fecha fin debe ser menor  a ${this.facturaService.getTextParam(382)}`);
      this.restartDateFin();
      return;
    }

    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(351)) {
      //si hay productos agregados no se puede cambiar la fechha
      if (this.facturaService.traInternas.length > 0) {
        //TODO:Translate

        let verificador: boolean = await this._notificationService.openDialogActions(
          {
            title: this._translate.instant('¿Cambiar fecha?'),
            description: this._translate.instant("El total del precio por día de las transacciones agregadas al documento volverá a calcularse en base a la nueva fecha ingresada."),
            verdadero: this._translate.instant('pos.botones.aceptar'),
            falso: this._translate.instant('pos.botones.cancelar'),
          }
        );

        if (!verificador) {
          this.restartDateFin();
          return;
        };


        //Calcular nuevos totales
        if (this.facturaService.valueParametro(351)) {

          for (const tra of this.facturaService.traInternas) {
            let count: number = 0;


            this.facturaService.isLoading = true;

            let res: ResApiInterface = await this._productService.getFormulaPrecioU(
              this.token,
              this.facturaService.fechaIni!,
              this.facturaService.fechaFin,
              tra.precioCantidad!.toString(),
            );

            this.facturaService.isLoading = false;


            if (!res.status) {
              this._notificationService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

              console.error(res);

              return;
            }

            let calculoDias: PrecioDiaInterface[] = res.response;

            if (calculoDias.length == 0) {

              res.response = "El procedimiento almacenado no esta devolviendo valores, verificar.";

              this._notificationService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

              console.error(res);

              return;
            }


            this.facturaService.traInternas[count].precioDia = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].total = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].cantidadDias = calculoDias[0].catidad_Dia;


            count++;

          }

          this.facturaService.calculateTotales();
        }


      }

    }


    //Actuali<ar copaias 
    //Copiar valores
    this.facturaService.copyFechaIni = new Date(this.facturaService.fechaIni!);
    this.facturaService.copyFechaFin = new Date(this.facturaService.fechaFin!);


    this.facturaService.saveDocLocal()

  }


  abrirTimePicker(timepicker: NgxMaterialTimepickerComponent) {
    timepicker.open();
  }


  changeCuentaRef() {

    if (!this.globalConvertService.editDoc) return;
    console.log("Solicitar permisos");

  }

  async changeSerie() {

    //cargar datos que dependen de la serie 
    let serie: string = this.facturaService.serie!.serie_Documento;

    this.facturaService.isLoading = true;

    //buscar vendedores
    let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
    )


    if (!resVendedor.status) {

      this.facturaService.isLoading = false;

      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resVendedor);

      return;

    }


    this.facturaService.vendedores = resVendedor.response;

    //si solo hay un vendedor seleccionarlo por defecto
    if (this.facturaService.vendedores.length == 1) {
      this.facturaService.vendedor = this.facturaService.vendedores[0];
      this.facturaService.saveDocLocal();

    }

    //Buscar tipos transaccion
    let resTransaccion: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
    );

    if (!resTransaccion.status) {

      this.facturaService.isLoading = false;


      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resTransaccion);

      return;

    }

    this.facturaService.tiposTransaccion = resTransaccion.response;

    //Buscar parametros del documento
    let resParametro: ResApiInterface = await this._parametroService.getParametro(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
      this.estacion,
    )

    if (!resParametro.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resParametro);

      return;

    }

    this.facturaService.parametros = resParametro.response;

    this.facturaService.montos = [];
    this.facturaService.traInternas = [];

    //Buscar formas de pago
    let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
      this.token,
      this.empresa,
      serie,
      this.documento,
    );


    if (!resFormaPago.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resFormaPago);

      return;

    }


    this.facturaService.formasPago = resFormaPago.response;


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


      if (this.facturaService.tiposReferencia.length == 1) {
        this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
      }

    }


    this.facturaService.isLoading = false;



  }

  // Función para manejar el cambio de estado del switch
  setCF(): void {
    this.switchState = !this.switchState;

    console.log(this.switchState);


    if (this.switchState) {
      this.facturaService.cuenta = {
        cuenta_Correntista: 1,
        cuenta_Cta: "1",
        factura_Nombre: "CONSUMIDOR FINAL",
        factura_NIT: "C/F",
        factura_Direccion: "CIUDAD",
        cC_Direccion: "Ciudad",
        des_Cuenta_Cta: "C/F",
        direccion_1_Cuenta_Cta: "Ciudad",
        eMail: "",
        telefono: "",
        limite_Credito: 0,
        permitir_CxC: false,
        celular: null,
        des_Grupo_Cuenta: null,
        grupo_Cuenta: null

      }

      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
      this.facturaService.saveDocLocal();


    } else {
      this.facturaService.cuenta = undefined;
      this.facturaService.saveDocLocal();

    }
  }

  verError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }


    PreferencesService.error = error;
    this._eventService.verInformeErrorEvent(true);
  }


  // Función de filtrado
  async buscarCliente() {

    //Validar que el componente 
    if (!this.facturaService.searchClient) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    // Limpiar la lista de registros antes de cada búsqueda
    this.facturaService.isLoading = true;

    let resCuenta: ResApiInterface = await this._cuentaService.getClient(
      this.user,
      this.token,
      this.empresa,
      this.facturaService.searchClient,
    );

    this.facturaService.isLoading = false;

    if (!resCuenta.status) {

      this.facturaService.isLoading = false;


      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resCuenta);

      return;

    }

    let cuentas: ClienteInterface[] = resCuenta.response;


    //si no hay coicidencias mostrar mensaje
    if (cuentas.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinCoincidencias'));
      return;
    }


    //si solo hay uno seleccioanrlo
    if (cuentas.length == 1) {
      this.facturaService.cuenta = cuentas[0];
      this.facturaService.searchClient = this.facturaService.cuenta.factura_Nombre;
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
      this.facturaService.saveDocLocal();

      return;
    }

    //si hay mas de una coicidencia mostrar dialogo
    let estado = this._dialog.open(ClientesEncontradosComponent, { data: cuentas })
    estado.afterClosed().subscribe(result => {
      if (result) {

        let cliente: ClienteInterface = result[0];
        this.facturaService.cuenta = cliente;
        this.facturaService.searchClient = this.facturaService.cuenta.factura_Nombre;

        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
        this.facturaService.saveDocLocal();

      }
    })



  }

  agregarCliente() {
    this._eventService.verCrearEvent(true);
    // this.verNuevoCliente.emit(true);
  }

  actualizar() {
    this._eventService.verActualizarEvent(this.facturaService.cuenta!);
    // this.verActualizarCliente.emit(true);
  }




  //convertir una fecha ngbDateStruct a fecha Date.
  convertirADate(ngbDate: NgbDateStruct): Date {
    if (ngbDate) {
      let { year, month, day } = ngbDate;
      return new Date(year, month - 1, day); // Restar 1 al mes,
    };
    return new Date();
  };

}
