import { Injectable  } from '@angular/core';
import { Http , Response, RequestOptions, Headers } from '@angular/http';
import { DatePipe } from "@angular/common";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';


import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';


import {
  MqttMessage,
  MqttModule,
  MqttService
} from 'ngx-mqtt';

import { Pois } from '../models/pois';
import * as L from 'leaflet';

@Injectable()
export class PoisService {

  private selectedSensorSource = new Subject<Pois>();
  selectedSensor$ = this.selectedSensorSource.asObservable();

  pin_pois = L.icon({
    iconUrl: "../assets/pois.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [35, 38], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });

  pin_pois01 = L.icon({
    iconUrl: "../assets/poi01.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });

  pin_pois02 = L.icon({
    iconUrl: "../assets/poi02.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });

  pin_pois03 = L.icon({
    iconUrl: "../assets/poi03.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [4, 4], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });

  pin_pois04 = L.icon({
    iconUrl: "../assets/poi04.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });

  pin_pois05 = L.icon({
    iconUrl: "../assets/poi05.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });

  pin_pois06 = L.icon({
    iconUrl: "../assets/poi06.png", // From https://www.iconfinder.com/search/?price=free
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
  });


  private markersMap = {}; // id: marker -> para dar o update ao marker certo

  //private stationsApiUrl = environment.orion_url + '/v2/entities/?type=PointOfInterest&options=keyValues&orderBy=dateCreated&limit=1000' ;
  private stationsApiUrl = environment.orion_url + '/v2/entities/?type=PointOfInterest&options=keyValues&orderBy=dateCreated&limit=1000' ;
  //private stationsApiUrl2 = 'http://207.249.127.45:1026' + '/v2/entities/?type=unidadEconomica&options=keyValues&orderBy=dateCreated&limit=1000' ;



// private cat01 = 'http://207.249.127.45:1026/v2/entities?type=unidadEconomica&q=subCategory==cerveza&options=keyValues&limit=1000';
//private cat02 = 'http://207.249.127.45:1026/v2/entities?type=unidadEconomica&q=subCategory==frutasVerduras&options=keyValues&limit=1000';
// private cat03 = 'http://207.249.127.45:1026/v2/entities?type=unidadEconomica&q=subCategory==telas&options=keyValues&limit=1000';
// private cat04 = 'http://207.249.127.45:1026/v2/entities?type=unidadEconomica&q=subCategory==carnesRojas&options=keyValues&limit=1000';
// private cat05 = 'http://207.249.127.45:1026/v2/entities?type=unidadEconomica&q=subCategory==alimentos&options=keyValues&limit=1000';
// private cat06 = 'http://207.249.127.45:1026/v2/entities?type=unidadEconomica&q=subCategory==carneAves&options=keyValues&limit=1000';

  private cat01 = /*environment.orion_url*/ 'http://207.249.127.45:1026/v2' +'/entities/?type=unidadEconomica&q=category==comercioPorMenor&options=keyValues&limit=1000';
  private cat02 = /*environment.orion_url*/ 'http://207.249.127.45:1026/v2' +'/entities/?type=PointOfInterest&q=category==culturaYRecreacion&options=keyValues&limit=1000';
  private cat03 = /*environment.orion_url*/ 'http://207.249.127.45:1026/v2' +'/entities/?type=PointOfInterest&q=category==preparacionAlimentos&options=keyValues&limit=1000';
  private cat04 = /*environment.orion_url*/ 'http://207.249.127.45:1026/v2' +'/entities/?type=PointOfInterest&q=category==rentaInmuebles&options=keyValues&limit=1000';
  private cat05 = /*environment.orion_url*/ 'http://207.249.127.45:1026/v2' +'/entities/?type=PointOfInterest&q=category==serviciosProfesionales&options=keyValues&limit=1000';
  private cat06 = /*environment.orion_url*/ 'http://207.249.127.45:1026/v2' +'/entities/?type=PointOfInterest&q=category==serviciosEducativos&options=keyValues&limit=1000';

  constructor(private http: Http,private _mqttService: MqttService, private datePipe: DatePipe) { }


  getPois() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });
    return this.http.get(this.stationsApiUrl, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });
  }

  getPoisCat01() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });
    return this.http.get(this.cat01, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });
  }

  getPoisCat02() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });
    return this.http.get(this.cat02, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });
  }

  getPoisCat03() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });

    return this.http.get(this.cat03, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });

    // return this.http.get(this.cat03 +'&orderBy=!dateObserved&offset='+offset, options=options).timeout(10000)
    //   .map((response: Response) => {
    //     return <PoisService[]> response.json();
    //   })
    //   .catch(err => {
    //     throw new Error(err.message)
    //   });
  }

  getPoisCat04() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });
    return this.http.get(this.cat04, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });
  }

  getPoisCat05() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });
    return this.http.get(this.cat05, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });
  }

  getPoisCat06() {
    let myHeaders = new Headers(
        {   'fiware-service': 'default',
            'fiware-servicepath': '/',
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        });

    let options = new RequestOptions({ headers: myHeaders });
    return this.http.get(this.cat06, options=options)
      .map((response: Response) => {
        return <PoisService[]> response.json();
      })
      .catch(err => {
        throw new Error(err.message)
      });
  }

  addToCluster(sensorArray, cluster: L.MarkerClusterGroup): void{
    for (let sensor of sensorArray){
      if (sensor['location']) {

        var popContent;

        if (sensor['url']) {
          sensor['image'] = sensor['url']
        }
        if(sensor['location']){
          popContent = '<b> Point of Interest Information</b><br/>' +
          '<br/><table class="table">'+ '<tr><td><span class="glyphicon glyphicon-scale" aria-hidden="true"></span></td>'+'<td> '+  sensor['id']  + '</td></tr>'
          +'<tr><td><span class="glyphicon glyphicon-home" aria-hidden="true"></span></td>'+'<td> ' + sensor['address']['addressLocality'] + '</td></tr>'
          +'<tr><td><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span></td>'+'<td> ' + sensor['name'] + '</td></tr>'
          +'<tr><td><span class="glyphicon glyphicon-time" aria-hidden="true"></span></td>'+'<td> ' + this.datePipe.transform(sensor['dateCreated'],"dd-MM-yy HH:mm:ss") + '</td></tr>'
          '</table>'
        }

        var marker = L.marker( [parseFloat(sensor['location']['coordinates'][1]),parseFloat(sensor['location']['coordinates'][0])], {
          icon: this["pin_pois"]
        }).bindPopup(popContent);




        this.markersMap[sensor.id] = marker;

        marker.addEventListener("popupopen", (e) => {
          this.selectedSensorSource.next(sensor);
        });
        marker.addEventListener("popupclose",(e) => {
          this.selectedSensorSource.next(null);
        });
        cluster.addLayer(marker);

      }

    }
  }

  addToLayer(sensorArray, layer, pin): void{
    for (let sensor of sensorArray){
      if (sensor['location']) {

        var popContent;

        if (sensor['url']) {
          sensor['image'] = sensor['url']
        }
        if(sensor['location']){
          popContent = '<b> '+ sensor['category'] +' : '+ sensor['subCategory']+'</b><br/>' +
          '<br/><table class="table">'+ '<tr><td><span class="glyphicon glyphicon-scale" aria-hidden="true"></span></td>'+'<td> '+  sensor['id']  + '</td></tr>'
          +'<tr><td><span class="glyphicon glyphicon-home" aria-hidden="true"></span></td>'+'<td> ' + sensor['address']['streetAddress'] + '</td></tr>'
          +'<tr><td><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span></td>'+'<td> ' + sensor['name'] + '</td></tr>'
          +'<tr><td><span class="glyphicon glyphicon-time" aria-hidden="true"></span></td>'+'<td> ' + this.datePipe.transform(sensor['dateCreated'],"dd-MM-yy HH:mm:ss") + '</td></tr>'
          '</table>'
        }

        var marker = L.marker( [parseFloat(sensor['location']['coordinates'][1]),parseFloat(sensor['location']['coordinates'][0])], {
          icon: this[pin]
        }).bindPopup(popContent);




        this.markersMap[sensor.id] = marker;

        marker.addEventListener("popupopen", (e) => {
          this.selectedSensorSource.next(sensor);
        });
        marker.addEventListener("popupclose",(e) => {
          this.selectedSensorSource.next(null);
        });
        marker.addTo(layer);

      }

    }
  }

}