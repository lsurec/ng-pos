import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent implements OnInit {
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;


  /**
   *
   */
  constructor(
    private _globalConvertSrevice: GlobalConvertService,

  ) {

  }
  ngOnInit(): void {
    console.log(this._globalConvertSrevice.screen);

  }

}
