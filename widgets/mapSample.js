/**
 * Copyright (C) 2000-2015 eBusiness Information
 *
 * This file is part of MapSquare Widgets.
 *
 * MapSquare Widgets is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapSquare Widgets is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MapSquare Widgets.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Created by Anthony Salembier and Jason Conard.
 */
var MapManager =  {
  widget : {},
  includeJS : function(fileName){
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = fileName + '.js';
    document.body.appendChild(js);
  },
  callHttpReq : function(method, url, headers) {
    var hreq = new XMLHttpRequest();

    hreq.onreadystatechange = function() {
      if(hreq.readyState == 4) {
        if(hreq.status >= 200 && hreq.status < 300) {
          if(hreq.successFunction){
            hreq.successFunction(JSON.parse(hreq.responseText));
          }
        } else if (hreq.status >= 400 && hreq.status < 600) {
          if(hreq.errorFunction){
            hreq.errorFunction();
          } else {
            console.error('Error status : ' + hreq.status);
          }
        }
        if(hreq.thenFunction) {
          hreq.thenFunction();
        }
      }
    };

    hreq.error = function(callback){
      hreq.errorFunction = callback;
      return hreq;
    };

    hreq.success = function(callback){
      hreq.successFunction = callback;
      return hreq;
    };

    hreq.then = function(callback){
      hreq.thenFunction = callback;
      return hreq;
    };

    hreq.open(method,url,true);

    if(headers) {
      var headersKeys = Object.keys(headers);
      headersKeys.forEach(function(headerKey){
        hreq.setRequestHeader(headerKey, headers[headerKey]);
      });
    }

    hreq.send(null);
    return hreq;
  },

  callMap : function(mapId, mapConfig, widgets) {

    var sizes = {
      small : [32, 40],
      medium : [48, 60],
      large : [64, 80]
    };

    var defaultBoolean = function(booleanItem, defaultVal) {
      if(booleanItem != null && booleanItem !== undefined) {
        return booleanItem;
      } else {
        return defaultVal;
      }
    };

    mapConfig.mapBounds = mapConfig.mapBounds || [[85, -180],[-65, 180]];
    mapConfig.tileServer = mapConfig.tileServer || 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    mapConfig.widgetConf = mapConfig.widgetConf || {};
    mapConfig.widgetConf.panelPosition = mapConfig.widgetConf.panelPosition || 'left';
    mapConfig.widgetConf.logoByType = defaultBoolean(mapConfig.widgetConf.logoByType, false);
    mapConfig.widgetConf.clickMarker = defaultBoolean(mapConfig.widgetConf.clickMarker, false);
    mapConfig.widgetConf.osmSearch = defaultBoolean(mapConfig.widgetConf.osmSearch, false);
    mapConfig.widgetConf.minZoom = mapConfig.widgetConf.minZoom || 3;
    mapConfig.widgetConf.maxZoom = mapConfig.widgetConf.maxZoom || 18;
    mapConfig.widgetConf.initialZoom = mapConfig.widgetConf.initialZoom || 3;
    mapConfig.widgetConf.initialLocation = mapConfig.widgetConf.initialLocation || [0,0];
    mapConfig.clusterMaxLevel = mapConfig.clusterMaxLevel || 18;


    var mapManager = {};

    mapManager.widgets = widgets;


    var mapSample = document.getElementById(mapId);

    var display = 'classic';
    var parentDisplay = getComputedStyle(mapSample.parentNode).display;
    if(parentDisplay.indexOf('flex') >= 0) {
      display = 'flexible';
    }

    mapSample.setAttribute('class','map-container '+ display);

    mapManager.rootElement = mapSample;

    var mapContent = document.createElement('div');
    mapContent.setAttribute('class', 'map-content '+ display);

    var mapElem = document.createElement('div');
    mapElem.setAttribute('id', mapId + '-map');
    mapElem.setAttribute('class', 'map-view '+display);

    mapContent.appendChild(mapElem);
    mapSample.appendChild(mapContent);

    mapManager.conf = mapConfig;

    // Add "maxBounds : mapConfig.mapBounds", on the options of map if you want to prohibit drawing the map outside the bounds.
    mapManager.map = L.map(mapId + '-map', { maxZoom : mapConfig.maxZoom, minZoom : mapConfig.minZoom, zoomControl : false});
    L.tileLayer(mapConfig.tileServer, {attribution: '<a href="http://openstreetmap.fr/" target="_blank">OpenStreetMap</a> | <a href="http://mapsquare.io/" target="_blank">mapsquare</a>'}).addTo(mapManager.map);

    var markerClusterGroup = new L.MarkerClusterGroup({disableClusteringAtZoom : mapConfig.clusterMaxLevel});
    mapManager.map.markerGroup = markerClusterGroup;
    mapManager.map.addLayer(markerClusterGroup);

    new L.Control.Zoom({ position: 'topright' }).addTo(mapManager.map);

    if(mapConfig.fitBounds) {
      mapManager.map.fitBounds(mapConfig.fitBounds);
    } else {
      mapManager.map.setView(mapConfig.initialLocation, mapConfig.initialZoom);
    }

    mapManager.getType = function(point) {
      for(var i = 0; i< mapManager.conf.types.length; i++) {
        var currentType = mapManager.conf.types[i];
        if(point.typeId === currentType.id) {
          return currentType;
        }
      }
      return null;
    };

    mapConfig.points = [];
    mapConfig.types = [];
    mapConfig.tracks = [];
    mapConfig.areas = [];

    mapManager.traces = L.layerGroup([]);
    mapManager.areas = L.layerGroup([]);
    mapManager.map.addLayer(mapManager.traces);
    mapManager.map.addLayer(mapManager.areas);

    var refreshButton = document.createElement('div');
    refreshButton.className = 'map-refresh';
    refreshButton.innerHTML = '<i class="fa fa-undo"></i>';
    mapSample.appendChild(refreshButton);

    refreshButton.addEventListener('click', function(){
      if(mapConfig.fitBounds) {
        mapManager.map.fitBounds(mapConfig.fitBounds);
      } else {
        mapManager.map.setView(mapConfig.initialLocation, mapConfig.initialZoom);
      }
    });

    initWidgets = function() {

      mapManager.conf.tracks.forEach(function(t) {
        var track;
        var latLngs = [];
        t.latLngList.forEach(function(latLng) {
          latLngs.push(L.latLng(latLng.lat, latLng.lng))
        });

        var options = {
          color: t.strokeOptions.strokeColor,
          weight: t.strokeOptions.strokeWeight,
          opacity: t.strokeOptions.strokeOpacity
        };

        track = L.polyline(latLngs, options);
        t.polyline = track;
        mapManager.traces.addLayer(track);
      });

      mapManager.conf.areas.forEach(function(p) {
        var polygon;
        var latLngs = [];
        p.latLngList.forEach(function(latLng) {
          latLngs.push(L.latLng(latLng.lat, latLng.lng))
        });

        var options = {};

        if (p.fillOptions) {
          options.fillColor = p.fillOptions.fillColor;
          options.fillOpacity = p.fillOptions.fillOpacity;
        } else {
          options.fill = false;
        }

        if (p.strokeOptions) {
          options.color = p.strokeOptions.strokeColor;
          options.weight = p.strokeOptions.strokeWeight;
          options.opacity = p.strokeOptions.strokeOpacity;
        } else {
          options.stroke = false;
        }

        polygon = L.polygon(latLngs, options);
        p.polygon = polygon;
        mapManager.areas.addLayer(polygon);
      });


      mapConfig.points = mapConfig.points.filter(function(point){
        point.typeItem = mapManager.getType(point);
        point.typeItem.enable = true;
        return point.typeItem;
      });

      mapConfig.points.forEach(function(point, index){

        point.iconUrl = mapConfig.poiServer + '/icon/' + point.typeItem.icon + '/' + point.typeItem.markerSize;

        var currentMarker = null;
        var anchorX = point.typeItem.anchorX;
        var anchorY = point.typeItem.anchorY;
        var popupAnchorX = -anchorX + ( sizes[point.typeItem.markerSize][0] / 2 );
        var popupAnchorY = -anchorY;

        var icon = L.icon({ iconUrl : point.iconUrl, iconAnchor: [anchorX,anchorY], popupAnchor : [popupAnchorX, popupAnchorY]});
        currentMarker = L.marker([point.latLng.lat, point.latLng.lng], {icon: icon});

        point.marker = currentMarker;
        point.enable = true;
        mapManager.map.markerGroup.addLayer(currentMarker);

        var itemNameStr = '<h4>'+point.name+'</h4>';
        if(!mapConfig.widgetConf.clickMarker) {
          currentMarker.bindPopup(itemNameStr).openPopup();
          currentMarker.closePopup();

          currentMarker.on('click', function() {
          });

          // Leaflet bug, simple click isn't triggered and dbclick is triggered as a simple one.
          currentMarker.on('dbclick', function() {
            currentMarker.togglePopup();
          });
        }
      });

      mapManager.utils = {
        addClass : function(elem, clazz) {
          if(elem.className.indexOf(clazz) < 0) {
            if(elem.className.length !== 0) {
              elem.className += " ";
            }
            elem.className += clazz;
          }
        },
        removeClass : function(elem, clazz) {
          elem.className = elem.className.replace(' '+ clazz, '').replace(clazz + ' ', '').replace(clazz, '');
        },
        toggleClass : function(elem, clazz) {
          if(elem.className.indexOf(clazz) < 0) {
            this.addClass(elem, clazz);
          } else {
            this.removeClass(elem, clazz);
          }
        },
        hasClass : function(elem, clazz) {
          return (' ' + elem.className + ' ').indexOf(' ' + clazz + ' ') > -1;
        },
        contains : function(array, elem) {
          var found = false;
          for (var i = 0; i < array.length && !found; i++) {
            if (array[i] === elem) {
              found = true;
            }
          }
          return found;
        }
      };


      widgets.forEach(function(widgetName) {
        if(MapManager.widget[widgetName]) {
          MapManager.widget[widgetName](mapManager);
        } else {
          console.error('The widget '+ widgetName + ' is not loaded or loaded after the callMap function.')
        }
      });
    };

    if (mapConfig.poiServer.length > 0) {
      MapManager.callHttpReq('GET', mapConfig.poiServer + '/type')
        .success(function(types) {
          mapManager.conf.types = types;
        }).error(function() {
          mapManager.conf.types = [];
        }).then(function() {
          MapManager.callHttpReq('GET', mapConfig.poiServer + '/poi')
            .success(function(points) {
              mapManager.conf.points = points;
              mapManager.conf.points.forEach(function(point) {
                point.latLngTable = [point.latLng.lat, point.latLng.lng];
              });
            }).error(function() {
              mapManager.conf.points = [];
            }).then(function() {

              // Filter types if there is no points available for any type.
              mapManager.conf.types = mapManager.conf.types.filter(function(type) {
                for (var i = 0; i < mapManager.conf.points.length; i++) {
                  if (mapManager.conf.points[i].typeId === type.id) {
                    return true;
                  }
                }
                return false;
              });

              MapManager.callHttpReq('GET', mapConfig.poiServer + '/track')
                .success(function(tracks) {
                  mapManager.conf.tracks = tracks;
                }).error(function() {
                  mapManager.conf.traces = [];
                }).then(function() {
                  MapManager.callHttpReq('GET', mapConfig.poiServer + '/polygon')
                    .success(function(polygons) {
                      mapManager.conf.areas = polygons;
                    }).error(function() {
                      mapManager.conf.areas = [];
                    }).then(function() {
                      MapManager.callHttpReq('GET', mapConfig.poiServer + '/layer/')
                        .success(function(layers) {
                          mapManager.conf.layers = layers;
                        }).error(function() {
                          mapManager.conf.layers = [];
                        }).then(initWidgets);
                    });
                });
            });
        })
    }
  }
};
