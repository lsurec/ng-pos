import { Component, OnInit } from '@angular/core';
import { DocumentoHistorialInterface, DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-docs-sin-confirmar',
  templateUrl: './docs-sin-confirmar.component.html',
  styleUrls: ['./docs-sin-confirmar.component.scss']
})
export class DocsSinConfirmarComponent implements OnInit {

  isLoading: boolean = false; //Pantalla de carga
  readonly regresar: number = 16; //id de la pantlla
  verError: boolean = false; // Ver pamtalla informe de errores
  historial: boolean = true;   //ver hisytorial
  detalleDocumento: boolean = false; //ver detalle de un docuento
  docSelect!: DocumentoHistorialInterface; //documento seleccionado
  estructura!: DocumentoResumenInterface;


  documentos: DocumentoHistorialInterface[] = [
    {
      idDocRef: "DOC001",
      ConsecutivoInterno: 1,
      fecha: new Date(2024, 5, 10, 17, 2, 0),
      subtotal: 100.00,
      cargo: 10.00,
      descuento: 5.00,
      total: 105.00,
      isChecked: false,
    },
    {
      idDocRef: "DOC002",
      ConsecutivoInterno: 2,
      fecha: new Date(2024, 5, 10, 17, 40, 0),
      subtotal: 200.00,
      cargo: 15.00,
      descuento: 10.00,
      total: 205.00,
      isChecked: false,
    },
    {
      idDocRef: "DOC003",
      ConsecutivoInterno: 3,
      fecha: new Date(2024, 5, 10, 17, 17, 0),
      subtotal: 150.00,
      cargo: 12.00,
      descuento: 7.00,
      total: 155.00,
      isChecked: false,
    },
    {
      idDocRef: "DOC004",
      ConsecutivoInterno: 4,
      fecha: new Date(2024, 5, 10, 17, 49, 0),
      subtotal: 250.00,
      cargo: 20.00,
      descuento: 15.00,
      total: 255.00,
      isChecked: false,
    },
    {
      idDocRef: "DOC005",
      ConsecutivoInterno: 5,
      fecha: new Date(2024, 5, 10, 17, 59, 0),
      subtotal: 250.00,
      cargo: 20.00,
      descuento: 15.00,
      total: 255.00,
      isChecked: false,
    }
  ];

  constructor(
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
  ) {

    //Evento para mostla lista de documentos
    this._eventService.verHistorialSinConfirmar$.subscribe((eventData) => {
      this.verHistorial();
    });

    //Coulatr informe de error
    this._eventService.verHistorialSinConfirmar$.subscribe((eventData) => {
      this.verError = false;
    });

    this.loadData();

  }

  loadData() {
    // for (let i = 0; i < this.documentos.length; i++) {
    //   this.fechas(this.documentos[i].fecha);
    // }

    // // this.start();
  }

  verDetalle() {
    this.facturaService.regresarAHistorial = 2;
    this.detalleDocumento = true;
    this.historial = false;
  }

  goBack() {
    // this._eventService.emitCustomEvent(true);
    this._eventService.regresarDesdeHistorialSinConfirmarEvent(true);
  }

  //ver la lista de documntos del hisytorial
  verHistorial() {
    this.detalleDocumento = false;
    this.historial = true;
  }

  showError() {
    this.verError = true;
    this.detalleDocumento = false;
    this.historial = false;
  }

  seleccionar() {
    this.documentos.forEach(element => {
      element.isChecked = this.facturaService.selectAllDoc;
    });

  }

  async eliminarProducto() {

    let traCheks: DocumentoHistorialInterface[] = this.documentos.filter((doc) => doc.isChecked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    this.documentos = this.documentos.filter((doc) => !doc.isChecked);

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionesEliminadas'));

  }

  intervalId: NodeJS.Timeout | null = null;
  startTime: number = 0;
  totalElapsedMinutes: number = 0;
  minutosTrascurridos: number = 5;

  start() {
    this.startTime = Date.now();

    this.intervalId = setInterval(() => {
      const currentTime: number = Date.now();
      const elapsedTime: number = currentTime - this.startTime;
      const elapsedMinutes: number = Math.floor(elapsedTime / 60000);

      if (elapsedMinutes >= this.minutosTrascurridos) {
        this.totalElapsedMinutes += elapsedMinutes;

        this._notificationsService.openSnackbar(`Han pasado ${this.totalElapsedMinutes} minutos`);
        console.log(`Han pasado ${this.totalElapsedMinutes} minutos`);
        this.startTime = currentTime; // Reinicia el inicio del tiempo
      }
    }, 1000); // Verifica cada segundo
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  iniciar(inicio: Date) {

    console.log(this.has24HoursPassed(inicio));


    console.log(inicio);

    const now: Date = new Date();
    const timeDiff: number = now.getTime() - inicio.getTime();
    const diffDays: number = timeDiff / (1000 * 3600 * 24);

    if (diffDays >= 1) {
      this.documentos = this.documentos.filter(doc => doc.fecha.getTime() !== inicio.getTime());
      this._notificationsService.openSnackbar(`Documento con fecha ${UtilitiesService.getFechaCompleta(inicio)} eliminado de la lista`);
    }
  }

  has24HoursPassed(date: Date): boolean {
    let currentDate: Date = new Date();
    let millisecondsIn24Hours: number = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    let timeDifference: number = currentDate.getTime() - date.getTime();

    return timeDifference >= millisecondsIn24Hours;
  }

  verificarFecha(date: Date) {

    if (this.has24HoursPassed(date)) {
      this.documentos = this.documentos.filter(doc => doc.fecha.getTime() !== date.getTime());
    }

    const now: Date = new Date();
    const timeDiff: number = now.getTime() - date.getTime();
    const diffDays: number = timeDiff / (1000 * 3600 * 24);

    if (diffDays >= 1) {
      this.documentos = this.documentos.filter(doc => doc.fecha.getTime() !== date.getTime());
      this._notificationsService.openSnackbar(`Documento con fecha ${UtilitiesService.getFechaCompleta(date)} eliminado de la lista`);
    }

  }

  fechas(date: Date) {
    if (this.has24HoursPassed(date)) {
      this.documentos = this.documentos.filter(doc => doc.fecha.getTime() !== date.getTime());
    }

  }


  ngOnInit() {
    this.checkDocumentDates();
  }

  checkDocumentDates() {
    const now = new Date();

    this.documentos = this.documentos.filter(async (doc) => {
      const timeDiff = now.getTime() - new Date(doc.fecha).getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      // this._notificationsService.openSnackbar(`Los documentos sin modificaciones en las ultimas 24 horas han sido eliminados.`);

    });
  }

  fechaActual?: Date = new Date();

  tiempoRestanteParaIgualdad(fechaRecibida: Date): string {
    // Obtener la fecha y hora actual
    this.fechaActual = new Date();

    // Obtener la hora actual
    const horaActual = this.fechaActual.getHours();

    // Obtener la hora de la fecha recibida
    const horaRecibida = fechaRecibida.getHours();

    // Calcular la diferencia en horas entre la hora actual y la hora de la fecha recibida
    let horasRestantes = horaRecibida - horaActual;

    // Si la diferencia es negativa, sumamos 24 horas
    if (horasRestantes < 0) {
      horasRestantes += 24;
    }

    // Calcular los minutos restantes hasta completar las 24 horas
    const minutosRestantes = Math.abs(fechaRecibida.getMinutes() - this.fechaActual.getMinutes());

    // Calcular los segundos restantes hasta completar las 24 horas
    let segundosRestantes = Math.abs(fechaRecibida.getSeconds() - this.fechaActual.getSeconds());

    // Si la cuenta de los segundos es positiva, restamos 1 segundo al total de segundos restantes
    if (segundosRestantes > 0) {
      segundosRestantes--;
    }

    this.fechas(fechaRecibida);

    // Retornar el mensaje con el tiempo restante
    return `El documento se eliminará en: ${horasRestantes} horas, ${minutosRestantes} minutos.`;
  }

}
