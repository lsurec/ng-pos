import { Component } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-search-doc',
  templateUrl: './search-doc.component.html',
  styleUrls: ['./search-doc.component.scss']
})
export class SearchDocComponent {


  constructor(
    private _notificationsService: NotificationsService,
    private _translate: TranslateService

  ) { }
  ascendente: boolean = true; //orden de la lista
  documentos: any[] = [];
  busqueda: string = "";
  botonIrArriba: boolean = false;
  botonIrAbajo: boolean = false;
  fechaInicial?: NgbDateStruct; //fecha inicial 
  fechaFinal?: NgbDateStruct; //fecha final

  filtrar() { }
  detalleDoc() {
  }

  scrollUp() { }
  scrollDown() { }

  loadData() { }

  sincronizarFechas() { }

  backPage() { }


}
