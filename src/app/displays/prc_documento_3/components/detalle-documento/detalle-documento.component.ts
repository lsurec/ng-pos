import { Component, Input, OnInit } from '@angular/core';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { EventService } from 'src/app/services/event.service';
import { DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';
import { Documento } from '../../interfaces/doc-estructura.interface';

@Component({
  selector: 'app-detalle-documento',
  templateUrl: './detalle-documento.component.html',
  styleUrls: ['./detalle-documento.component.scss']
})
export class DetalleDocumentoComponent implements OnInit {

  @Input() estructura: DocumentoResumenInterface | undefined; 
  regresar: number = 6;
  verError: boolean = false;

  constructor(
    private _eventService: EventService,
  ) {

    this._eventService.regresarResumenDocHistorial$.subscribe((eventData) => {
      this.verError = false;
    });
  }
  ngOnInit(): void {
    this.loadData()
    
  }

  async loadData(){
    
    console.log(this.estructura);

    let objDoc :Documento = this.estructura!.estructura;

    let empresa:number =objDoc.Doc_Empresa;
    let estacion:number = objDoc.Doc_Estacion_Trabajo;
    let tipoDoc:number = objDoc.Doc_Tipo_Documento;
    let serieDoc: string = objDoc.Doc_Serie_Documento;


    


    
  }

  productos: ProductoInterface[] = [
    {
      producto: 26,
      unidad_Medida: 1,
      producto_Id: "ALM03",
      des_Producto: "VIUDA Y ADOBADO",
      des_Unidad_Medida: "Unidad",
      tipo_Producto: 1
    },
    {
      producto: 33,
      unidad_Medida: 1,
      producto_Id: "ALM10",
      des_Producto: "ADOBADO A LA PARRILLA",
      des_Unidad_Medida: "Unidad",
      tipo_Producto: 1
    },
  ]

  compras: CompraInterface[] = [
    {
      producto: this.productos[0],
      cantidad: 3,
      precioUnitario: 55.00,
      total: 165.00,
    },
    {
      producto: this.productos[1],
      cantidad: 4,
      precioUnitario: 20.00,
      total: 80.00,
    }
  ]

  pagos: any[] = [
    {
      id: 1,
      nombre: "EFECTIVO",
      monto: 80,
    },
    {
      id: 1,
      nombre: "CHEQUE",
      monto: 165.00,
      autorizacion: "30393650",
      referencia: "",
      banco: "Banco Industrial"
    }
  ]

  goBack() {
    // this._eventService.emitCustomEvent(true);
    this._eventService.verHistorialEvent(true);
  }

  mostrarError(){
    this.verError = true;
  }

}
