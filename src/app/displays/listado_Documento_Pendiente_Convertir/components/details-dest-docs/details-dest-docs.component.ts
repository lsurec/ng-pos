import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-details-dest-docs',
  templateUrl: './details-dest-docs.component.html',
  styleUrls: ['./details-dest-docs.component.scss']
})
export class DetailsDestDocsComponent {

  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _eventService: EventService,

  ) {

  }


}
