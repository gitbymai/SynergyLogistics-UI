import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  ButtonDirective,
  ButtonModule
} from '@coreui/angular';

@Component({
  selector: 'app-newjob',
  imports: [
    CardBodyComponent, 
    CardComponent, 
    CardFooterComponent,
    CardHeaderComponent, 
    FormControlDirective, 
    FormDirective, 
    FormLabelDirective,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    ButtonDirective
  ],
  templateUrl: './newjob.component.html',
  styleUrl: './newjob.component.scss'
})
export class NewjobComponent {

}
