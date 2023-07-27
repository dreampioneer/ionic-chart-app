import { Component } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';
import ZoomPlugin from 'chartjs-plugin-zoom';
import { Utils } from '../../utils';
import axios, { Axios } from 'axios';

Chart.register(ZoomPlugin, StreamingPlugin);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})


export class Tab1Page {
  public serverUrl = "https://trinityaether.com/sensor/";

  public chartColors = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
    'rgb(255, 192, 203)',
    'rgb(165, 42, 42)',
    'rgb(0, 128, 128)'
  ];
  public date: {max: string, min: string}[] = [];

  public configFixed: { [key: string]: any } = {};
  public fixedChart: { [key: string]: any } = {};

  public configRealtime: { [key: string]: any } = {};
  public realtimeChart: { [key: string]: any } = {};

  public chartType:string = "realtime";

  public url = "http://192.168.1.114/routes/actions/getData.php";

  constructor(
  ) {
    this.createDateData();
  }

  ngOnInit(){
    this.createRealtimeConfig();
    this.createRealtimeChart();
    this.createFixedConfig();
    this.createFixedChart();
    this.initialFixedChart();
  }

  setMinValue(event: Event, chartNumber: number) {
    const targetElement = event.target as HTMLInputElement;
    this.configRealtime[chartNumber].options.scales.y.min =
      parseInt(targetElement.value);
    this.realtimeChart[chartNumber].update();
  }

  setMaxValue(event: Event, chartNumber: number) {
    const targetElement = event.target as HTMLInputElement;
    this.configRealtime[chartNumber].options.scales.y.max =
      parseInt(targetElement.value);
  }

  setFixedMinValue(event: Event, chartNumber: number){
    const targetElement = event.target as HTMLInputElement;
    this.configFixed[chartNumber].options.scales.y.min =
      parseInt(targetElement.value);
    this.fixedChart[chartNumber].update();
  }

  setFixedMaxValue(event: Event, chartNumber: number){
    const targetElement = event.target as HTMLInputElement;
    this.configFixed[chartNumber].options.scales.y.max =
      parseInt(targetElement.value);
    this.fixedChart[chartNumber].update();
  }

  changeDateInput(event: Event, chartNumber: number){
    this.getFixedData(chartNumber);
  }

  onRefresh(chart:any) {
    console.log("onRefresh");
    let table = "SN" + (chart.id + 1);
    let now = new Date().getTime();

    axios.get('http://192.168.1.114/routes/actions/getData.php', {
      params: {
        table: table,
        time: now.toString(),
      }
    })
    .then(function (response) {
      let addvalue = 0;
      if (response.data == 0) {
        addvalue = 0;
      } else {
        addvalue = response.data[0][1];
      }
      chart.data.datasets.forEach((dataset: ChartDataset) => {
        console.log({
          x: Date.now(),
          y: addvalue
        });
        dataset.data.push({
          x: Date.now(),
          y: addvalue
        });
      });
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
  }

  getFixedData(id: number){
    let table = "SN" + (id + 1);
    var start = Date.parse(this.date[id]["min"]);
    var end = Date.parse(this.date[id]["max"]);
    axios.get('http://192.168.1.114/routes/actions/getData.php', {
      params: {
        table: table,
        starttime: start,
        endtime: end
      }
    })
    .then( (response) => {
      var labels = response.data.map((item: { timestamp: any; }) => item.timestamp);
      var datas = response.data.map((item: { value: any; }) => item.value);
      console.log(labels);
      console.log(datas);
      this.configFixed[id].data.labels = labels;
      this.configFixed[id].data.datasets[0].data = datas;
      this.fixedChart[id].update();
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
  }

  createDateData(){
    for(let i = 0; i < 10; i++){
      this.date.push({ "max": "", "min": "" });
    }
  }

  createConfig(sensorLabel: string, borderColor: string) {
    return {
        type: 'line',
        data: {
            datasets: [{
                label: sensorLabel,
                backgroundColor: Utils.transparentize(borderColor, 0.5),
                borderColor: borderColor,
                fill: false,
                lineTension: 0,
                borderDash: [8, 4],
                data: [{x: 0, y: 0}]
            }]
        },
        options: {
          title: {
            display: true,
            text: 'Select Sensor'
          },
          scales: {
            x: {
              type: 'realtime',
              realtime: {
                unit: 'second',
                displayFormats: {
                  second: 'YYYY-MM-DD HH:mm:ss'
                },
                tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
                duration: 20000,
                refresh: 1000,
                delay: 2000,
                onRefresh: this.onRefresh
              }
            },
            y: {
              type: 'linear',
              display: true,
              // ticks: {
              //     min: 0, // minimum value
              //     max: 0 // maximum value
              // },
              scaleLabel: {
                display: true,
                labelString: 'value'
              }
            },
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
                  minDelay: 0,
                  maxDelay: 4000,
                  minDuration: 1000,
                  maxDuration: 20000
                }
              }
            }
          }
        }
    };
  }

  createRealtimeConfig(){
    for(let i = 0; i < 10; i++){
      this.configRealtime[i] = this.createConfig('Sensor' + i, this.chartColors[i]);
    }
  }

  createFConfig(sensorLabel:string, borderColor:string) {
    return {
        type: 'line',
        data: {
          labels: ['2022-01-01T00:00:00', '2022-01-02T00:00:00', '2022-01-03T00:00:00', '2022-01-04T00:00:00', '2022-01-05T00:00:00', '2022-01-06T00:00:00',
'2022-01-07T00:00:00', '2022-01-08T00:00:00', '2022-01-09T00:00:00', '2022-01-10T00:00:00', '2022-01-11T00:00:00', '2022-01-12T00:00:00',
'2022-01-13T00:00:00', '2022-01-14T00:00:00', '2022-01-15T00:00:00', '2022-01-16T00:00:00', '2022-01-17T00:00:00', '2022-01-18T00:00:00',
'2022-01-19T00:00:00', '2022-01-20T00:00:00', '2022-01-2T00:00:00', '2022-01-22T00:00:00', '2022-01-23T00:00:00', '2022-01-24T00:00:00'],
          datasets: [{
              label: sensorLabel,
              backgroundColor: Utils.transparentize(borderColor, 0.5),
              borderColor: borderColor,
              fill: false,
              lineTension: 0,
              borderDash: [8, 4],
              data: [100, 150, 170, 180,130,120,100, 150, 170, 180,130,120,100, 150, 170, 180,130,120,100, 150, 170, 180,130,120]
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Select Sensor'
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
            }
          }
          // tooltips: {
          //   mode: 'nearest',
          //   intersect: false
          // },
          // hover: {
          //   mode: 'nearest',
          //   intersect: false
          // },
          // pan: {
          //   enabled: true,
          //   mode: 'x',
          //   rangeMax: {
          //     x: 4000
          //   },
          //   rangeMin: {
          //     x: 0
          //   }
          // },
          // zoom: {
          //   enabled: true,
          //   mode: 'x',
          //   rangeMax: {
          //     x: 20000
          //   },
          //   rangeMin: {
          //     x: 1000
          //   }
          // }
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
                minDelay: 0,
                maxDelay: 4000,
                minDuration: 1000,
                maxDuration: 20000
              }
            }
          }
        }
    };
  }

  createFixedConfig(){
    for(let i = 0; i < 10; i++){
      this.configFixed[i] = this.createFConfig('Sensor' + i, this.chartColors[i]);
    }
  }

  createRealtimeChart(){
    for(let i = 0; i < 10; i++){
      this.realtimeChart[i] = new Chart("realtimeChart" + i, this.configRealtime[i]);
    }
  }

  createFixedChart(){
    for(let i = 0; i < 10; i++){
      this.fixedChart[i] = new Chart("fixedChart" + i, this.configFixed[i]);
    }
  }

  initialFixedChart() {
    var start = Date.now() - 24*60*60*1000;
    var end = Date.now();
    for (var i = 0; i < 10; i++) {
      let table = "SN" + (i + 1);
      axios.get("http://192.168.1.114/routes/actions/getData.php", {
        params: {
          table: table,
          starttime: start,
          endtime: end
        }
      })
      .then((response) => {
        var labels = response.data.map((item: { timestamp: any; }) => item.timestamp);
        var datas = response.data.map((item: { value: any; }) => item.value);
        console.log(labels);
        console.log(datas);
        this.configFixed[i].data.labels = labels;
        this.configFixed[i].data.datasets[0].data = datas;
        this.fixedChart[i].update();
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
    }
  }
}
