import { Component, Input, OnInit } from '@angular/core';

import { ChartType, ChartOptions } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {

  @Input()
  doughnutChartData: MultiDataSet; //= [ [55, 25] ];
    
  chartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false
    }
  }

  donutColors = [
    { 
      backgroundColor: ['rgba(63,145,74,0.5)', 'rgba(220,20,60, 0.5)'],
      borderColor: ['rgba(148,159,177, 0)', 'rgba(148,159,177, 0)']
    },
  ];

  doughnutChartLabels: Label[] = ['Locked', 'Circulating'];
  // doughnutChartData: MultiDataSet = [ [55, 25] ];
  doughnutChartType: ChartType = 'doughnut';

  constructor() { }

  ngOnInit(): void {
  }

}
