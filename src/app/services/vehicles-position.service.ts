import { Injectable  } from '@angular/core';
import { Http , Response, RequestOptions, Headers } from '@angular/http';
import { DatePipe } from "@angular/common";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { Subject }    from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

import {
  MqttMessage,
  MqttModule,
  MqttService
} from 'ngx-mqtt';

import * as L from 'leaflet';
import { Vehicle } from '../models/vehicle';

@Injectable()
export class VehiclePositionService {

    private selectedSensorSource = new Subject<Vehicle>();
    selectedSensor$ = this.selectedSensorSource.asObservable();

    pin_car = L.icon({
    iconUrl: "../assets/pin-car.png",
    iconSize:     [35, 38], // size of the icon
    iconAnchor:   [17.5, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -38] // point from which the popup should open relatixe to the iconAnchor
    });


    private markersMap = {}; // id: marker -> para dar o update ao marker certo

    private stationsApiUrl = environment.orion_url + '/v2/entities?type=Vehicle&options=keyValues,count&limit=800&attrs=%2A,dateCreated,dateModified&orderBy=%21dateModified' ;

    constructor(private http: Http,private _mqttService: MqttService, private datePipe: DatePipe) { }

    getVehiclesPosition() {
        let myHeaders = new Headers({
            'fiware-service': 'default',
            'fiware-servicepath': '/',
        });

        let options = new RequestOptions({ headers: myHeaders });

        return this.http.get(this.stationsApiUrl, options=options).map((response: Response) => {
            console.log(response);
            return <Vehicle[]> response.json();
        }).catch(err=>{throw new Error(err.message)});
    }


    public getJSON(): Observable<any> {
        return this.http.get("./assets/aircontrol-config.json").map((res) => res.json()).catch(err=>{throw new Error(err.message)});
    }

    addToMap(sensorArray, map):void {
        for(let sensor of sensorArray){
            if(sensor['location']){

                var popContent = '<b> Vehicle Information</b><br/>' +
                                '<br/><table class="table">'
                                +'<tr><td><span class="glyphicon glyphicon-scale" aria-hidden="true"></span></td>'+'<td> '+  sensor['id']  + '</td></tr>'
                                +'<tr><td>Speed</td>'+'<td> '+  sensor['speed']  + '</td></tr>'
                                +'<tr><td>Heading</td>'+'<td> ' + sensor['heading'] + '</td></tr>'
                                +'<tr><td>Odometer</td>'+'<td> ' + sensor['mileageFromOdometer'] + '</td></tr>'
                                +'<tr><td>Date Observed</td>'+'<td> ' + sensor['dateObserved'] + '</td></tr>'
                                '</table>'

                var marker = L.marker( [parseFloat(sensor['location']['coordinates'][1]),parseFloat(sensor['location']['coordinates'][0])], {
                    icon: this["pin_car"]
                }).bindPopup(popContent);

                this.markersMap[sensor.id] = marker;

                marker.addEventListener("popupopen", (e) => {
                    this.selectedSensorSource.next(sensor);
                });

                marker.addEventListener("popupclose",(e) => {
                    this.selectedSensorSource.next(null);
                });

                marker.addTo(map);
            }
        }
    }

    addToLayer(sensorArray, layer):void {
        for(let sensor of sensorArray){
            if(sensor['location']){

                var popContent = '<b> Vehicle Information</b><br/>' +
                                '<br/><table class="table">'
                                +'<tr><td><span class="glyphicon glyphicon-scale" aria-hidden="true"></span></td>'+'<td> '+  sensor['id']  + '</td></tr>'
                                +'<tr><td>Speed</td>'+'<td> '+  sensor['speed']  + '</td></tr>'
                                +'<tr><td>Heading</td>'+'<td> ' + sensor['heading'] + '</td></tr>'
                                +'<tr><td>Odometer</td>'+'<td> ' + sensor['mileageFromOdometer'] + '</td></tr>'
                                +'<tr><td>Date Observed</td>'+'<td> ' + sensor['dateObserved'] + '</td></tr>'
                                '</table>'

                var marker = L.marker( [parseFloat(sensor['location']['coordinates'][1]),parseFloat(sensor['location']['coordinates'][0])], {
                    icon: this["pin_car"]
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

    getUpdates(map){
        this._mqttService.observe('realtimeVehiclePosition').subscribe((message:MqttMessage) => {
            var updated = <Vehicle[]> JSON.parse(message.payload.toString()).data;
            for(let sensor of updated){
                var marker: L.Marker = this.markersMap[sensor.id];
                if(marker){
                    var popContent = '<b> Vehicle Information</b><br/>' +
                                    '<br/><table class="table">'
                                    +'<tr><td><span class="glyphicon glyphicon-scale" aria-hidden="true"></span></td>'+'<td> '+  sensor['id']  + '</td></tr>'
                                    +'<tr><td>Speed</td>'+'<td> '+  sensor['speed']  + '</td></tr>'
                                    +'<tr><td>Heading</td>'+'<td> ' + sensor['heading'] + '</td></tr>'
                                    +'<tr><td>Odometer</td>'+'<td> ' + sensor['mileageFromOdometer'] + '</td></tr>'
                                    +'<tr><td>Date Observed</td>'+'<td> ' + sensor['dateObserved'] + '</td></tr>'
                                    '</table>'
                    var lat = (parseFloat(sensor['location']['coordinates'][1]));
                    var lng = (parseFloat(sensor['location']['coordinates'][0]));
                    var newLatLng = new L.LatLng(lat, lng);
                    marker.setLatLng(newLatLng);
                    marker.bindPopup(popContent);
                }
            }
        });
    }

}
