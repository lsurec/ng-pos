import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';
import { DocumentService } from '../../services/document.service';
import { FacturaService } from '../../services/factura.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GetDocInterface } from '../../interfaces/get-doc.interface';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { TipoTransaccionInterface } from '../../interfaces/tipo-transaccion.interface';
import { Documento } from '../../interfaces/doc-estructura.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
  providers: [
    DocumentService,
    TipoTransaccionService,
  ]
})
export class HistorialComponent implements OnInit {

  isLoading: boolean = false;
  historial: boolean = true;
  detalleDocumento: boolean = false;
  regresar: number = 5;
  verError: boolean = false;

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this._facturaService.tipoDocumento!;

  documentos: DocumentoResumenInterface[] = [];
  docSelect?:DocumentoResumenInterface;

  constructor(
    private _eventService: EventService,
    private _documentService: DocumentService,
    private _facturaService: FacturaService,
    private _tiposTransaccion: TipoTransaccionService,
  ) {

    this._eventService.verHistorial$.subscribe((eventData) => {
      this.verHistorial();
    });

    this._eventService.regresarHistorial$.subscribe((eventData) => {
      this.verError = false;
    });
  }
  ngOnInit(): void {

    this.loadData();
  }

  async loadData() {

    this.documentos = [];

    this.isLoading = true;


    let resDoc = await this._documentService.getDocument(
      this.user,
      this.token,
      0,
    )


    if (!resDoc.status) {
      this.isLoading = false;

      this.mostrarError(resDoc);
      

      return;
    }

    let docs: GetDocInterface[] = resDoc.response;


    for (const doc of docs) {


      let estructura: Documento = JSON.parse(doc.estructura);

      let resTra = await this._tiposTransaccion.getTipoTransaccion(
        this.user,
        this.token,
        estructura.Doc_Tipo_Documento,
        estructura.Doc_Serie_Documento,
        estructura.Doc_Empresa,
      );


      if (!resTra.status) {
        this.isLoading = false;

        this.mostrarError(resTra);
        return;
      }

      let tiposTra: TipoTransaccionInterface[] = resTra.response;

      //id tipo transaccion cargo
      let tipoCargo: number = this.resolveTipoTransaccion(4, tiposTra);

      //id tipo transaccion descuento
      let tipoDescuento: number = this.resolveTipoTransaccion(3, tiposTra);

      //Totales
      let cargo: number = 0;
      let descuento: number = 0;
      let subtotal: number = 0;
      let total: number = 0;


      estructura.Doc_Transaccion.forEach(tra => {
        //Si no es ni cargo ni desceuntosumar total transaccones
        if (tra.Tra_Tipo_Transaccion != tipoCargo &&
          tra.Tra_Tipo_Transaccion != tipoDescuento) {
          subtotal += tra.Tra_Monto;
        }

        //sii es cargo sumar cargo
        if (tra.Tra_Tipo_Transaccion == tipoCargo) {
          cargo += tra.Tra_Monto;
        }

        //si es descuento sumar descuento
        if (tra.Tra_Tipo_Transaccion == tipoDescuento) {
          descuento += tra.Tra_Monto;
        }
      });


      //calcular total
      total = (subtotal + cargo) + descuento;

      this.documentos.push(
        {
          item: doc,
          estructura: estructura,
          cargo: cargo,
          descuento: descuento,
          subtotal: subtotal,
          total: total,
        }
      );

    }

    this.isLoading = false;


  }

  resolveTipoTransaccion(tipo: number, tiposTransacciones: TipoTransaccionInterface[]): number {

    for (let i = 0; i < tiposTransacciones.length; i++) {
      const element = tiposTransacciones[i];
      if (tipo == element.tipo) {
        return element.tipo_Transaccion;
      }

    }

    return 0;
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  verDetalle() {
    
    this.detalleDocumento = true;
    this.historial = false;
  }

  verHistorial() {
    this.detalleDocumento = false;
    this.historial = true;
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
}
