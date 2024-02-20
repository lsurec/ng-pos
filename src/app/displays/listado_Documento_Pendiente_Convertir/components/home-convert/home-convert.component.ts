import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-home-convert',
  templateUrl: './home-convert.component.html',
  styleUrls: ['./home-convert.component.scss']
})
export class HomeConvertComponent implements OnInit {

  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;

  verTiposDocConversion: boolean = false;
  verDocOrigen: boolean = false;
  verDocDestino: boolean = false;
  verDocConversion: boolean = false;
  verDetalleDocConversion: boolean = false;


  /**
   *
   */
  constructor(private _globalConvertService: GlobalConvertService) {

  }

  ngOnInit(): void {

    switch (this._globalConvertService.screen) {
      case "tipos_cot":
        this.verTiposDocConversion = true;
        break;

      case "list_cot":
        this.verDocOrigen = true;
        break;

      default:
        break;
    }

  }



}
