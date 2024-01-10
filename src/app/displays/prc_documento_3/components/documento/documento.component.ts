import { Component, EventEmitter, Output } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { MatDialog } from '@angular/material/dialog';
import { ClientesEncontradosComponent } from '../clientes-encontrados/clientes-encontrados.component';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaService } from '../../services/cuenta.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { ParametroService } from '../../services/parametro.service';
import { PagoService } from '../../services/pago.service';

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

  @Output() newItemEvent = new EventEmitter<string>();

  switchState: boolean = false;



  constructor(
    private _dialog: MatDialog,
    private translate: TranslateService,
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _cuentaService: CuentaService,
    private _notificationService: NotificationsService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
  ) {
  }

  async changeSerie() {

    //cargar datos que dependen de la serie 
    let serie: string = this.facturaService.serie!.serie_Documento;
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;
    let estacion: number = PreferencesService.estacion.estacion_Trabajo;
    let documento: number = this.facturaService.tipoDocumento!;


    this.facturaService.isLoading = true;

    //buscar vendedores
    let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
      user,
      token,
      documento,
      serie,
      empresa,
    )

    if (!resVendedor.status) {
      this.facturaService.isLoading = false;
      this._notificationService.showErrorAlert(resVendedor);
      return;
    }

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

    if (!resTransaccion.status) {
      this.facturaService.isLoading = false;
      this._notificationService.showErrorAlert(resTransaccion);
      return;
    }

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

    if (!resParametro.status) {
      this.facturaService.isLoading = false;
      this._notificationService.showErrorAlert(resParametro);
      return;
    }

    this.facturaService.parametros = resParametro.response;

    //Buscar formas de pago
    let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
      token,
      empresa,
      serie,
      documento,
    );

    if (!resFormaPago.status) {
      this.facturaService.isLoading = false;

      this._notificationService.showErrorAlert(resFormaPago);
      return;

    }
    this.facturaService.isLoading = false;


    this.facturaService.formasPago = resFormaPago.response;


  }

  // Función para manejar el cambio de estado del switch
  toggleSwitch(): void {
    this.switchState = !this.switchState;
    this.selectedCliente = false;
  }

  searchText!: string;
  selectedOption: number | null = 1;


  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "SKU",
    },
    {
      id: 2,
      nombre: "Descripción",
    },
  ];


  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }

  listaClientes: ClienteInterface[] = [
    {
      nit: 12345678,
      nombre: "Cliente1",
      direccion: "zona 1",
      telefono: 0,
      correo: "",
    },
    {
      nit: 23456789,
      nombre: "Comprador",
      direccion: "zona 1",
      telefono: 0,
      correo: "",
    },
    {
      nit: 34567890,
      nombre: "OtroCliente",
      direccion: "zona 1",
      telefono: 0,
      correo: "",
    },
    {
      nit: 45678901,
      nombre: "Cliente3",
      direccion: "zona 21",
      telefono: 0,
      correo: "",
    },
    {
      nit: 56789012,
      nombre: "Juan",
      direccion: "zona 5",
      telefono: 0,
      correo: "",
    },
    {
      nit: 67890123,
      nombre: "Maria",
      direccion: "zona 7",
      telefono: 0,
      correo: "",
    },
  ];

  registros: ClienteInterface[] = [];
  selectedCliente: boolean = false;
  cliente!: ClienteInterface;

  // Función de filtrado
  buscarCliente(terminoBusqueda: string): void {
    // Limpiar la lista de registros antes de cada búsqueda
    this.registros.length = 0;

    // Convertir el término de búsqueda a minúsculas para hacer la búsqueda sin distinción entre mayúsculas y minúsculas
    let terminoMinusculas = terminoBusqueda.toLowerCase();

    // Filtrar la lista de clientes
    this.listaClientes.forEach((cliente) => {
      const nombreMinusculas = cliente.nombre.toLowerCase();
      const nitStr = cliente.nit.toString(); // Convertir el NIT a cadena para facilitar la comparación

      if (nombreMinusculas.includes(terminoMinusculas) || nitStr.includes(terminoMinusculas)) {
        this.registros.push(cliente);
      }

      if (this.searchText.length == 0) {
        this.registros = [];
      }

    });

    if (this.registros.length == 1) {
      this.cliente = this.registros[0];
      this.selectedCliente = true;
    }

    // Puedes agregar lógica adicional aquí si es necesario

    if (this.registros.length > 1) {
      let estado = this._dialog.open(ClientesEncontradosComponent, { data: this.registros })
      estado.afterClosed().subscribe(result => {
        if (result) {
          console.log(result[0]);

          let cliente: ClienteInterface = result[0];
          this.cliente = cliente;
          this.selectedCliente = true;
        }
      })
    }
  }

  agregarCliente() {
    this._eventService.verCrearEvent(true);
    // this.verNuevoCliente.emit(true);
  }

  actualizar() {
    this._eventService.verActualizarEvent(this.cliente);
    // this.verActualizarCliente.emit(true);
  }


}
