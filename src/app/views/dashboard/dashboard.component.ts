import { NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {   ReactiveFormsModule } from '@angular/forms';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  FormControlDirective,
  GutterDirective,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  FormCheckComponent,
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, NgForm} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import {HttpClient, HttpHeaders } from '@angular/common/http'; 


interface IUser {
  name: string;
  message: string;
  avatar: string;
  aiRes: boolean;
}

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    imports: [ MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule,  WidgetsDropdownComponent, FormCheckComponent, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, FormControlDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressBarDirective, ProgressComponent, WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent]
})
export class DashboardComponent implements OnInit {

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {}

  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);
  private readonly LLM_SERVER: string = 'http://localhost:105/gen-therapy-convo/?question=';
  private readonly baseHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
  })
  private readonly USER_AVATAR_URL: string = './assets/images/avatars/1.jpg';
  private readonly AI_AVATAR_URL: string = './assets/images/avatars/2.jpg';
  public users: IUser[] = [];

  public  registerUser(form: NgForm) {
    const question: string = form.value?.question
    if (question?.length) {
      this.getAiResponse(question);
      this.users.unshift(
        {
          name: 'Stella Jones',
          message: question,
          avatar: this.USER_AVATAR_URL,
          aiRes: false
        },
      )
      form.reset()
    } 
  }

  public getAiResponse(question: string){
    this.http.get(`${this.LLM_SERVER}${question}`, {
      headers: this.baseHeaders,
    }).subscribe((res: any) => {
        this.users.unshift(
          {
            name: 'AI Helper',
            message: res?.res,
            avatar: this.AI_AVATAR_URL,
            aiRes: true
          },
        )
    }, error => {
      // TODO: show error message
    });
  }
}
