import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-home-convert',
  templateUrl: './home-convert.component.html',
  styleUrls: ['./home-convert.component.scss']
})
export class HomeConvertComponent implements OnInit {


  constructor(public globalConvertService: GlobalConvertService,
  ) { }


  ngOnInit(): void {

    //Al cargar el componente evaluar que pantalla se va a mostrar 
    switch (this.globalConvertService.screen) {
      case "tipos_cot":
        //si hay mas  de un tipo de documento disponoble ver pantalla para seleccianrse
        this.globalConvertService.verTiposDocConversion = true;

        break;

      case "list_cot":
        //si solo hay un tipo de documento deisponible ver lista de documentos pendientes de recepcionar
        this.globalConvertService.verDocOrigen = true;
        break;

      default:
        //Si no es ninguna opcion no hacer nada
        break;
    }
  }
}
