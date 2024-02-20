import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-origin-docs',
  templateUrl: './origin-docs.component.html',
  styleUrls: ['./origin-docs.component.scss']
})
export class OriginDocsComponent implements OnInit {

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
