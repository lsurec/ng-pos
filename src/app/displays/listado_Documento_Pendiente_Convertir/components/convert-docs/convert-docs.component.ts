import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-convert-docs',
  templateUrl: './convert-docs.component.html',
  styleUrls: ['./convert-docs.component.scss']
})
export class ConvertDocsComponent {
  selectAll: boolean = false; // seleccionar todas las trasnsacciones


  elementos: any[] = [
    {
      id: 30,
      idDocumento: 306,
      producto: "CERTIFICACIÓN DE SERVICIO",
      cantidad: 10.0,
      disponible: 13.0,
      autorizar: 13.0,
      checked: true
    },
    {
      id: 30,
      producto: "COCA-COLA",
      cantidad: "0.0",
      disponible: 13.0,
      autorizar: 13.0,
      checked: false
    },
    {
      id: 30,
      producto: "COCA-COLA",
      cantidad: 10.0,
      disponible: 13.0,
      autorizar: 13.0,
      checked: false
    }
  ]

  constructor(
    public globalConvertSrevice: GlobalConvertService,

  ) {

  }

  //para selecionar todas las transacciones
  seleccionar() {
    // this.facturaService.montos.forEach(element => {
    //   element.checked = this.selectAllMontos; //asiganer valor del checkbox a las formas de pago
    // });
  }

  backPage(docDestino: number) {
    if (docDestino == 0) this.globalConvertSrevice.mostrarDocOrigen();

    if (docDestino == 1) this.globalConvertSrevice.mostrarDocDestino()
  }

}
