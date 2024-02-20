import { Component } from '@angular/core';

@Component({
  selector: 'app-convert-docs',
  templateUrl: './convert-docs.component.html',
  styleUrls: ['./convert-docs.component.scss']
})
export class ConvertDocsComponent {
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;
}
