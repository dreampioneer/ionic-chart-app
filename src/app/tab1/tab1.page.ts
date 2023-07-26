import { Component } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';
import ZoomPlugin from 'chartjs-plugin-zoom';

Chart.register(ZoomPlugin, StreamingPlugin);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    pink: 'rgb(255, 192, 203)',
    brown: 'rgb(165, 42, 42)',
    teal: 'rgb(0, 128, 128)'
  };

  constructor() {}

  onRefresh(chart: Chart){
    chart.data.datasets.forEach((dataset: ChartDataset) => {
      dataset.data.push({
        x: Date.now(),
        y: Math.random()
      });
    });
  }



  public datasets: ChartDataset[] = [{
    label: 'Dataset 1',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    borderColor: 'rgb(255, 99, 132)',
    borderDash: [8, 4],
    fill: true,
    data: []
  }];

  public options: ChartOptions = {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 2000,
          onRefresh: this.onRefresh
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    interaction: {
      intersect: false
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x'
        },
        zoom: {
          pinch: {
            enabled: true
          },
          wheel: {
            enabled: true
          },
          mode: 'x'
        },
        limits: {
          x: {
          }
        }
      }
    }
  };

}
