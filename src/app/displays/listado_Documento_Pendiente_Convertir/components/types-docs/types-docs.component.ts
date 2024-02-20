import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent implements OnInit {

  /**
   *
   */
  constructor(
    private _globalConvertSrevice:GlobalConvertService,

  ) {
    
  }
  ngOnInit(): void {
    console.log(this._globalConvertSrevice.screen);
    
  }

}
