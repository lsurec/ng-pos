import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.scss'],
  providers: [
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
  ]
})
export class DocumentoComponent {
  //abrir selectores de horas
  @ViewChild('defaultTime') horaEntregaPiker?: NgxMaterialTimepickerComponent;
  @ViewChild('defaultTime') horaRegogerPiker?: NgxMaterialTimepickerComponent;
  @ViewChild('defaultTime') horaInicioPiker?: NgxMaterialTimepickerComponent;
  @ViewChild('defaultTime') horaFinalPiker?: NgxMaterialTimepickerComponent;


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
  ) {

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


  setDateEntrega() {
    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(351)) {
      //si hay productos agregados no se puede cambiar la fechha
      if (this.facturaService.traInternas.length > 0) {
        //TODO:Translate
        this._notificationService.openSnackbar("Para cambiar la fecha elimine primero las transacciones.");
        //TODO:Reestablecer primera fecha

        return;
      }

    }

    this.facturaService.fechaEntrega = this.convertValidDate(this.facturaService.inputFechaEntrega!, this.facturaService.horaEntrega);

    if (this.facturaService.fechaEntrega > this.facturaService.fechaRecoger!) {

      this.facturaService.fechaRecoger = this.facturaService.fechaEntrega;

      this.facturaService.fechaRecoger.setTime(this.facturaService.fechaEntrega.getTime() + (30 * 60000)); 

      this.facturaService.inputFechaRecoger =UtilitiesService.getStructureDate(this.facturaService.fechaEntrega)
      
      this.facturaService.horaRecoger = UtilitiesService.getHoraInput(this.facturaService.fechaEntrega);
      

    }

  }

  setDateRecoger() {
    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(351)) {
      //si hay productos agregados no se puede cambiar la fechha
      if (this.facturaService.traInternas.length > 0) {
        //TODO:Translate
        this._notificationService.openSnackbar("Para cambiar la fecha elimine primero las transacciones.");
        //TODO:Reestablecer primera fecha

        return;
      }

    }

    this.facturaService.fechaRecoger = this.convertValidDate(this.facturaService.inputFechaRecoger!, this.facturaService.horaRecoger);
  }
  setDateIncio() {
    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(351)) {
      //si hay productos agregados no se puede cambiar la fechha
      if (this.facturaService.traInternas.length > 0) {
        //TODO:Translate
        this._notificationService.openSnackbar("Para cambiar la fecha elimine primero las transacciones.");
        //TODO:Reestablecer primera fecha

        return;
      }

    }

    this.facturaService.fechaIni = this.convertValidDate(this.facturaService.inputFechaInicial!, this.facturaService.horaIncial);


    if (this.facturaService.fechaIni > this.facturaService.fechaFin!) {

      this.facturaService.fechaFin = this.facturaService.fechaIni;

      this.facturaService.fechaFin.setTime(this.facturaService.fechaIni.getTime() + (30 * 60000)); 

      this.facturaService.inputFechaFinal =UtilitiesService.getStructureDate(this.facturaService.fechaIni)
      
      this.facturaService.horaFinal = UtilitiesService.getHoraInput(this.facturaService.fechaIni);
      

    }
  }
  setDateFin() {
    //si se debe calcular el preciuo por dias
    if (this.facturaService.valueParametro(351)) {
      //si hay productos agregados no se puede cambiar la fechha
      if (this.facturaService.traInternas.length > 0) {
        //TODO:Translate
        this._notificationService.openSnackbar("Para cambiar la fecha elimine primero las transacciones.");
        //TODO:Reestablecer primera fecha

        return;
      }

    }

    this.facturaService.fechaFin = this.convertValidDate(this.facturaService.inputFechaFinal!, this.facturaService.horaFinal);
  }


  abrirTimePicker(timepicker: NgxMaterialTimepickerComponent) {
    timepicker.open();
  }

  changeVendedor() {
    this.facturaService.saveDocLocal();

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

    this.facturaService.isLoading = false;


    this.facturaService.formasPago = resFormaPago.response;


  }

  // Función para manejar el cambio de estado del switch
  setCF(): void {
    this.switchState = !this.switchState;

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
