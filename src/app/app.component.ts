import { Component, OnInit } from '@angular/core';
import { environment } from '../environment/environment';
import { NewsService } from 'src/service/news.service';
import { StopListService } from 'src/service/stop-list.service';
import { CoordinatesService } from 'src/service/coordinates.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <p>NewsApp</p>
    <app-stop-list [stops]="stops" [newsData]="newsDataArray"></app-stop-list>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'NewsApp';
  newsType!: string;
  newsTitle!: string;
  newsDescription!: string;
  newsImage!: string;
  newsData: any[] = [];
  mqttConfig = environment.mqtt;
  state: any;
  stops: any[] = [];
  latitude = 56.920602;
  longitude = 14.595295;
  coordinates: { latitude: number; longitude: number }[] = [];
  newsDataArray: any[] = [];
  blacklistSources = '';
  private previousStopList: any;

  constructor(
    private newsService: NewsService,
    private stopListService: StopListService,
    private coordinatesService: CoordinatesService,
  ) {}

  ngOnInit(): void {
    this.initConnection();
    this.fetWeatherCoordinates(
      this.latitude,
      this.longitude,
      this.blacklistSources,
    );
  }

  /**
   * fetch coordinates
   */
  fetWeatherCoordinates(
    latitude: number,
    longitude: number,
    blacklistSources: any,
  ): void {
    this.newsService
      .getNewsCoordinats(latitude, longitude, blacklistSources)
      .pipe(filter((data) => data !== undefined))
      .subscribe({
        next: (data) => {
          const weatherDataWithLatLong = {
            latitude: latitude,
            longitude: longitude,
            data: data,
          };
          this.newsDataArray.push(weatherDataWithLatLong);
          console.log('API news:', data);
        },
        error(err) {
          console.error('Something wrong occurred: ' + err);
        },
      });
  }

  /**
   * Connec LibPIS with MQTT broker
   */
  initConnection() {
    if (!window.luminator.pis) {
      console.error('luminator or pis is not defined');
    }

    window.luminator.pis.init(this.mqttConfig);

    window.luminator.pis.client.updates().subscribe({
      next: (state: any) => {
        if (state) {
          console.log('LibPis ', state);
          this.receiveStopList(state);
          this.receiveCoordinates(state);
        } else {
          console.log('Waiting for data...');
        }
      },
      error: (error: any) => {
        console.error('Error occurred while fetching data:', error);
      },
    });
  }

  /**
   * get lat and lon
   */

  receiveCoordinates(state: any): void {
    if (state.stopList && state.stopList.length > 0) {
      const areStopsSame = this.areStopsSame(state.stopList);
      if (areStopsSame) {
        console.log('data is same ');
        return;
      }
      // If the data is different, update the previous stop list
      this.previousStopList = state.stopList;
      const coordinates = this.coordinatesService.getCoordinates(
        state.stopList,
      );
      console.log('coordinates:', coordinates);
      if (coordinates) {
        this.coordinates = coordinates;
        this.coordinates.forEach((element) => {
          this.fetWeatherCoordinates(element.latitude, element.longitude, '');
        });
      } else {
        this.coordinates = [];
      }
    } else {
      console.log('StopList is either undefined or empty');
      this.coordinates = [];
    }
  }

  /**
   * Check if the stop names are the same
   */
  areStopsSame(stopList: any[]): boolean {
    if (
      !stopList ||
      !this.previousStopList ||
      stopList.length !== this.previousStopList.length
    ) {
      return false;
    }
    for (let i = 0; i < stopList.length; i++) {
      if (
        !stopList[i].name ||
        !this.previousStopList[i].name ||
        stopList[i].name !== this.previousStopList[i].name
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * get stop list
   */
  receiveStopList(state: any): void {
    const stopNames = this.stopNames(state.stopList);
    this.stops = stopNames;
    console.log('Stop names: ', stopNames);
    this.stopListService.setStops(stopNames);
    const retrievedStops = this.stopListService.getStops();
    console.log('Retrieved stops:', retrievedStops);
  }

  stopNames(stopList: any): any[] {
    return stopList;
  }
}
