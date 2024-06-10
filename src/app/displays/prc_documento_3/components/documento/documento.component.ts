import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
export class DocumentoComponent implements OnInit, OnDestroy, AfterViewInit {
  //abrir selectores de horas
  @ViewChild('horaRefIni') horaRefIni: any;
  @ViewChild('horaRefFin') horaRefFin: any;
  @ViewChild('horaIni') horaIni: any;
  @ViewChild('horaFin') horaFin: any;

  //para seleciconar el valor del texto del input
  @ViewChild('clienteInput') clienteInput?: ElementRef;

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

  //Formato de fecha dia-mes-año
  formatDate(date: NgbDateStruct): string {
    return `${this.padZero(date.day)}-${this.padZero(date.month)}-${date.year}`;
  }

  //agregar 0 al inicio de los dias o meses menores a 10
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

  //formato fecha inicio del evento
  fechaIni(date: NgbDateStruct) {
    this.facturaService.fechaInicialFormat = this.formatDate(date);
    this.facturaService.inputFechaIni = date;
    this.setDateIni();
  }

  //formato fecha fin del evento
  fechaFin(date: NgbDateStruct) {
    this.facturaService.fechaFinalFormat = this.formatDate(date);
    this.facturaService.inputFechaFinal = date;
    this.setDateFin();
  }

  //formato fecha ref inicio del evento
  fechaIniRef(date: NgbDateStruct) {
    this.facturaService.fechaRefInicialFormat = this.formatDate(date);
    this.facturaService.inputFechaRefIni = date;

    this.setDateRefIni();
  }

  //formato fecha ref fin del evento
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

    //Copiar valores
    this.copyDates();

    this.facturaService.saveDocLocal()

  }


  setDateRefFin() {

    this.facturaService.fechaRefFin = this.convertValidDate(this.facturaService.inputFechaRefFin!, this.facturaService.formControlHoraRefFin.value);
    this.facturaService.saveDocLocal()

  }


  async setDateIni() {
    this.facturaService.fechaIni = this.convertValidDate(this.facturaService.inputFechaIni!, this.facturaService.formControlHoraIni.value);

    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(44)) {
      //si hay productos agregados no se puede cambiar la fechha


      if (this.facturaService.traInternas.length > 0) {
        //Calcular nuevos totales

        if (UtilitiesService.majorOrEqualDateWithoutSeconds(this.facturaService.fechaFin!, this.facturaService.fechaIni)) {


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
              this._notificationService.openSnackbar(this._translate.instant('pos.alertas.noCalculoDias'));
              console.error(res);

              return;
            }

            let calculoDias: PrecioDiaInterface[] = res.response;

            if (calculoDias.length == 0) {
              res.response = "No se están obteniendo valores del procedimiento almacenado"
              this._notificationService.openSnackbar(this._translate.instant('pos.alertas.noCalculoDias'));
              console.error(res);

              return;
            }

            this.facturaService.traInternas[count].precioDia = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].total = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].cantidadDias = calculoDias[0].catidad_Dia;


            count++;

          }

          this.facturaService.calculateTotales();
          this._notificationService.openSnackbar(this._translate.instant('pos.alertas.recalcularFechas'));
        }
        else {
          this._notificationService.openSnackbar(this._translate.instant('pos.alertas.fechasInvalidas'));
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
    //si se debe calcular el preciuo por dias

    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(44)) {
      //si hay productos agregados no se puede cambiar la fechha

      if (UtilitiesService.majorOrEqualDateWithoutSeconds(this.facturaService.fechaFin, this.facturaService.fechaIni!)) {

        if (this.facturaService.traInternas.length > 0) {

          //Calcular nuevos totales

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
              this._notificationService.openSnackbar(this._translate.instant('pos.alertas.noCalculoDias'));
              console.error(res);

              return;
            }

            let calculoDias: PrecioDiaInterface[] = res.response;

            if (calculoDias.length == 0) {
              res.response = "No se están obteniendo valores del procedimiento almacenado"
              this._notificationService.openSnackbar(this._translate.instant('pos.alertas.noCalculoDias'));
              console.error(res);

              return;
            }

            this.facturaService.traInternas[count].precioDia = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].total = calculoDias[0].monto_Calculado;
            this.facturaService.traInternas[count].cantidadDias = calculoDias[0].catidad_Dia;


            count++;

          }

          this.facturaService.calculateTotales();
          this._notificationService.openSnackbar(this._translate.instant('pos.alertas.recalcularFechas'));
        }

      } else {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.fechasInvalidas'));
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
    //TODO: Permisos
  }

  async changeSerie() {


    if (this.facturaService.traInternas.length > 0) {

      let verificador = await this._notificationService.openDialogActions(
        {
          //TODO:Translate
          title: "¿Estás seguro?",
          description: "Estás a punto de cambiar de serie, las transacciones actuales se perderán.",
          verdadero: this._translate.instant('pos.botones.aceptar'),
          falso: "Cancelar",
        }
      );

      if (!verificador) {
        this.facturaService.serie = this.facturaService.serieCopy;
        return;
      };

    }

    this.facturaService.serieCopy = this.facturaService.serie;

    //y si hay otros datos alertar al usuario 
    //cargar datos que dependen de la serie 
    let serie: string = this.facturaService.serie!.serie_Documento;

    this.facturaService.isLoading = true;


    this.facturaService.vendedores = [];
    this.facturaService.vendedor = undefined;

    //buscar vendedores
    let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
    );

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

    this.facturaService.tiposTransaccion  = [];

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

    this.facturaService.parametros;

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


    this.facturaService.formasPago = [];

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


    this.facturaService.searchProduct = "";

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
      this.facturaService.searchClient = "";

      return;
    }


    //si solo hay uno seleccioanrlo
    if (cuentas.length == 1) {
      this.facturaService.cuenta = cuentas[0];
      this.facturaService.searchClient = this.facturaService.cuenta.factura_Nombre;
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
      this.facturaService.saveDocLocal();
      this.facturaService.searchClient = "";

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
        this.facturaService.searchClient = "";

      }
    })

    this.facturaService.searchClient = "";

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

  selectText() {
    this.focusAndSelectText();
  }


  ngAfterViewInit() {
    this.focusAndSelectText();
  }

  focusAndSelectText() {
    const inputElement = this.clienteInput!.nativeElement;
    inputElement.focus();

    // Añade un pequeño retraso antes de seleccionar el texto
    setTimeout(() => {
      inputElement.setSelectionRange(0, inputElement.value.length);
    }, 0);
  }

}
