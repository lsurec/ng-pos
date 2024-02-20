import { Component } from '@angular/core';

@Component({
  selector: 'app-destination-docs',
  templateUrl: './destination-docs.component.html',
  styleUrls: ['./destination-docs.component.scss']
})
export class DestinationDocsComponent {
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;
}