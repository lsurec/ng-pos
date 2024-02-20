import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-home-convert',
  templateUrl: './home-convert.component.html',
  styleUrls: ['./home-convert.component.scss']
})
export class HomeConvertComponent implements OnInit {

 


  /**
   *
   */
  constructor(public globalConvertService: GlobalConvertService) {

  }

  ngOnInit(): void {

    switch (this.globalConvertService.screen) {
      case "tipos_cot":
        this.globalConvertService.verTiposDocConversion = true;

        break;

      case "list_cot":
        this.globalConvertService.verDocOrigen = true;
        break;

      default:
        break;
    }

  }

}
