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

@Component({
  selector: 'app-documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.scss']
})
export class DocumentoComponent {

  @Output() newItemEvent = new EventEmitter<string>();

  switchState: boolean = false;


  vendedor!: string;
  vendedores: string[] = [
    "Proveedor",
    "Vendedor 01",
    "DEMOSOFT"
  ]

  constructor(
    private _dialog: MatDialog,
    private _location: Location,
    private translate: TranslateService,
    private _router: Router,
    private _eventService: EventService,
    public facturaService: FacturaService,
  ) {
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
