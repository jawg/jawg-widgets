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
MapManager.widget['search-widget'] = function(mapManager) {

  var searchMarker;
  var templatesFunctions = {
    getSearchWidget : function(){
      var elem = document.createElement('div');
      elem.className = 'search-widget search-widget-closed';
      elem.innerHTML =
        '<div class="search-widget-container">' +
        '<div class="search-widget-button"><i class="fa fa-search"></i></div>' +
        '<div class="search-widget-reduce"><i class="fa fa-caret-left"></i></div>' +
        '<div class="search-panel-content">' +
        '<div class="search-input">' +
        '<input class="map-search"/>' +
        '<div class="clickable search-input-icon eye-btn"><i class="fa fa-eye"></i></div>' +
        '<div class="clickable search-input-icon del-btn"><i class="fa fa-times"></i></div>' +
        '</div>' +
        '<div class="iti-search search-widget-itinerary"></div>' +
        '<div class="search-widget-content">' +
        '<div class="search-widget-results"></div>' +
        '<div class="search-widget-iti-panel"></div>' +
        '</div>' +
        '<div class="iti-close clickable search-widget-close-iti">' +
        '<span> Close itinerary </span>' +
        '</div>' +
        '</div>'
      '</div>';
      return elem;
    },

    getField : function(notVisible) {
      var elem = document.createElement('div');
      elem.className = 'search-elem clickable';
      var innerHTML = '';
      if (notVisible) {
        innerHTML +=
          '<i class="fa fa-eye-slash"></i>'
          + '&nbsp;';
      }
      innerHTML += '<span class="name"></span>';
      elem.innerHTML = innerHTML;
      return elem;
    },

    getItinerary : function() {
      var elem = document.createElement('div');
      elem.innerHTML =
        '<div class="search-input">' +
        '<input class="itinerary-search"/>' +
        '<div class="clickable search-input-icon eye-btn"><i class="fa fa-eye"></i></div>' +
        '<div class="clickable search-input-icon del-btn"><i class="fa fa-times"></i></div>' +
        '</div>' +
        '<div class="iti-types clickable">' +
        '<div class="iti-type iti-type-car"><i class="fa fa-car"></i></div>' +
        '<div class="iti-type iti-type-bicycle" style="display:none"><i class="fa fa-bicycle"></i></div>' +
        '<div class="iti-type iti-type-pedestrian" style="display"><i class="fa fa-male"></i></div>' +
        '<div class="iti-type iti-type-bus"><i class="fa fa-bus"></i></div>' +
        '</div>';

      return elem;
    },

    getItineraryPanel : function() {
      var elem = document.createElement('div');
      elem.className = 'search-widget-iti';
      elem.innerHTML =
        '<h3>Itinerary :</h3>' +
        '<div class="tpl-dist"></div>' +
        '<div class="tpl-time"></div>' +
        '<div class="tpl-desc"></div>' +
        '<div class="tpl-pagination">' +
        '<div class="tplp-back clickable"><i class="fa fa-arrow-left"></i></div>' +
        '<div class="tplp-page">' +
        '<span class="tplp-text">' +
        'Page <span class="tplp-current"></span> on <span class="tplp-end"></span>' +
        '</span>' +
        '</div>' +
        '<div class="tplp-next clickable"><i class="fa fa-arrow-right"></i></div>' +
        '</div>';
      return elem;
    },

    getManeuver : function() {
      var elem = document.createElement('div');
      elem.className = 'tpl-maneuver';
      elem.innerHTML =
        '<div class="tplm-text">' +
        '<span class="tpl-maneuver-desc"></span>' +
        '</div>' +
        '<div class="tplm-dist">' +
        '<span> </span>' +
        '</div>';
      return elem;
    },

    getNavitia : function() {
      var elem = document.createElement('div');
      elem.className = 'search-widget-journey';
      elem.innerHTML =
        '<h4 class="journey-title"></h4>' +
        '<p class="journey-desc">' +
        '<span class="jd-steps"></span>' +
        '<br/><span class="jd-dep"></span>' +
        '<br/><span class="jd-arr"></span>' +
        '</p>' +
        '<p class="journey-sections"></p>';
      return elem;
    }
  };

  var routePagination = {
    page : 0,
    nbPage : 0,
    itemPerPage: 10,
    nextPage : function() { this.page = this.page < this.nbPage-1 ? this.page+1 : this.page; },
    previousPage : function() { this.page = this.page > 0 ? this.page-1 : this.page; }
  };

  var photonRequest = null;
  var gouvRequest = null;
  var textLength = 0;
  var currentSearchField = null;

  var itiTypesId = ['iti-type-car', 'iti-type-bicycle', 'iti-type-pedestrian', 'iti-type-bus'];
  var currentItiType = itiTypesId[0];

  var mainItem = templatesFunctions.getSearchWidget();
  var mapContainerElem = mapManager.rootElement.querySelector('.map-content');
  mapContainerElem.appendChild(mainItem);

  var containers = {
    'itinerary' : mainItem.querySelector('.search-widget-itinerary'),
    'results' : mainItem.querySelector('.search-widget-results'),
    'itineraryPanel' : mainItem.querySelector('.search-widget-iti-panel'),
    'closeItinerary' : mainItem.querySelector('.search-widget-close-iti')
  };

  containers.closeItinerary.addEventListener('click', function() {
    if(containers.itineraryPanel.style.display === 'none') {
      containers.itineraryPanel.style.display = 'block' ;
      containers.closeItinerary.querySelector('span').textContent = 'Close itinerary';
    } else {
      containers.itineraryPanel.style.display = 'none';
      containers.closeItinerary.querySelector('span').textContent = 'Open itinerary';
    }
  });

  mapManager.searchWidgetOpen = false;
  mapManager.toggleSearchWidgetOpen = function() {
    mapManager.searchWidgetOpen = !mapManager.searchWidgetOpen;

    if(mapManager.searchWidgetOpen) {
      mainItem.className = 'search-widget search-widget-open';

      if (mapManager.markersWidgetOpen != null && mapManager.markersWidgetOpen !== undefined) {
        mapManager.markersWidgetOpen = true;
        mapManager.toggleMarkersWidgetOpen();
      }
      if (mapManager.toggleLayerMenu && mapManager.layerMenuOpened) {
        mapManager.toggleLayerMenu();
      }

    } else {
      mainItem.className = 'search-widget search-widget-closed';
    }
  };

  var reduceElem = mainItem.querySelector('.search-widget-reduce');
  reduceElem.addEventListener("click", function() {
    mapManager.toggleSearchWidgetOpen();
  });

  /*------------------------------------------------------------------*/
  /*--------------------- Mapping of API data -----------------------*/
  /*----------------------------------------------------------------*/

  /**
   * Map an item with photon data
   * @param photonItem
   * @returns {{latlng: *[], name: (Object|*), bounds: *[]}}
   */
  var mapPhoton = function(photonItem){
    // Get photon POI data
    var photonLatlng = photonItem.geometry.coordinates;
    var photonBounds = photonItem.properties.extent;

    var latlng = [photonLatlng[1], photonLatlng[0]];
    var bounds = photonBounds ? [ [photonBounds[1],photonBounds[0]] , [photonBounds[3],photonBounds[2]] ] : null;

    var labelTab = ['name', 'housenumber', 'street', 'city', 'state', 'country'];

    // Build the label according to labelTab fields
    var label = labelTab.reduce(function (previousValue, now, index, arr) {
      var returnedLabel = photonItem.properties[now];

      var separator = ', ';

      // Test if we have a number, dont show ','
      if (index > 0 && !isNaN(photonItem.properties[arr[index - 1]])) {
        separator = ' ';
      }

      if (!previousValue || !previousValue.length) {
        return returnedLabel;
      } else if (returnedLabel) {
        return previousValue + separator + returnedLabel;
      } else {
        return previousValue;
      }
    }, 0);
    return {'latlng' : latlng, 'name': label, 'bounds' : bounds};
  };

  /**
   * Map an item with adresse.data.gouv data
   * @param gouvItem
   * @returns {{latlng: *[], name: *, bounds: null}}
   */
  var mapGouv = function(gouvItem){
    var gouvLatlng = gouvItem.geometry.coordinates;
    var latlng = [gouvLatlng[1], gouvLatlng[0]];
    var label = gouvItem.properties.label;
    return {'latlng' : latlng, 'name': label, 'bounds' : null};
  };

  /**
   * Map an item with conf points
   * @param point
   * @returns {{latlng: *[], name: *, internal: boolean}}
   */
  var mapPoints = function(point){
    return {'latlng' : point.latLngTable, 'name' : point.name, 'internal' : true};
  };

  /*------------------------------------------------------------------*/
  /*--------------------- Itinerary management ----------------------*/
  /*----------------------------------------------------------------*/

  /**
   * Show the itinerary panel and the 4 types buttons
   */
  var showItinerary = function() {
    // Bind the itinerary field
    var itiSearchClone = templatesFunctions.getItinerary();
    containers.itinerary.appendChild(itiSearchClone);
    var itinerarySearchElem = mainItem.querySelector(".itinerary-search");
    itinerarySearchElem.addEventListener("keyup", keyupEvent, false);
    itinerarySearchElem.addEventListener("click",
      function() {
        showSearchResults();
      }
    );

    var currentItiTypeDomItem = itiSearchClone.querySelector('.'+currentItiType);
    currentItiTypeDomItem.className = currentItiTypeDomItem.className.replace(' selected','') + ' selected';

    // Bind type buttons
    itiTypesId.forEach(function(itiType){
      itiSearchClone.querySelector('.'+itiType).addEventListener('mousedown', function(){
        var thatElem = this;
        var lastType = itiSearchClone.querySelector('.'+currentItiType);
        lastType.className = lastType.className.replace(' selected','');
        currentItiType = itiType;
        thatElem.className = thatElem.className + ' selected';
        showSearchResults(true);
      });
    });
  };

  /**
   * Set the view of routes from API
   * @param result
   * @param mapper
   */
  var routeView = function(result, mapper) {
    var routes = mapper(result);


    var cloneNav = templatesFunctions.getItineraryPanel();

    cloneNav.querySelector('.tpl-dist').textContent = 'Travel distance: ' + routeDistance(routes.distance);
    cloneNav.querySelector('.tpl-time').textContent = 'Travel time: ' + routeTime(routes.time);
    cloneNav.querySelector('.tpl-desc').textContent = '';

    routePagination.nbPage = Math.ceil(routes.maneuvers.length / routePagination.itemPerPage);
    routePagination.page = 0;

    cloneNav.querySelector('.tplp-current').textContent = routePagination.page+1;
    cloneNav.querySelector('.tplp-end').textContent = routePagination.nbPage;

    var routeDescriptor = cloneNav.querySelector('.tpl-desc');
    var currentPage = cloneNav.querySelector('.tplp-current');

    var refreshRouteView = function() {
      currentPage.textContent = routePagination.page+1;
      var visibleManeuvers = routes.maneuvers.slice(routePagination.page*routePagination.itemPerPage, (routePagination.page+1)*routePagination.itemPerPage);
      routeDescriptor.textContent = '';
      visibleManeuvers.forEach(function(maneuver){

        var cloneManeuver = templatesFunctions.getManeuver();
        cloneManeuver.querySelector('.tpl-maneuver-desc').textContent = maneuver.text;
        cloneManeuver.querySelector('.tplm-dist').querySelector('span').textContent = routeDistance(maneuver.distance);

        routeDescriptor.appendChild(cloneManeuver);

      });
    };

    refreshRouteView();

    cloneNav.querySelector('.tplp-back').addEventListener('click', function(){
      routePagination.previousPage();
      refreshRouteView();
    });

    cloneNav.querySelector('.tplp-next').addEventListener('click', function(){
      routePagination.nextPage();
      refreshRouteView();
    });


    containers.itineraryPanel.appendChild(cloneNav);


    mapManager.utils.addClass(containers.closeItinerary, 'shown');
  };


  /*

   Owner : OSRM
   API here : https://github.com/Project-OSRM/osrm-backend/wiki/Server-api
   Decode function found HERE : https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU AFFERO General Public License as published by
   the Free Software Foundation; either version 3 of the License, or
   any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU Affero General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
   or see http://www.gnu.org/licenses/agpl.txt.
   */
  // OSRM routing geometry
  // [renders routing geometry]

  //decode compressed route geometry
  decodeOSRM = function(encoded, precision) {
    precision = Math.pow(10, -precision);
    var len = encoded.length, index=0, lat=0, lng = 0, array = [];
    while (index < len) {
      var b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      //array.push( {lat: lat * precision, lng: lng * precision} );
      array.push( [lat * precision, lng * precision] );
    }
    return array;
  };

  var getOSRMData = function(osrmResults) {
    var routeGeometry = decodeOSRM(osrmResults.route_geometry, 6);
    var instructions = osrmResults.route_instructions;

    var locations = [];

    if(mapManager.itinerary) {
      mapManager.map.removeLayer(mapManager.itinerary);
    }
    mapManager.itinerary = L.polyline(routeGeometry, {color: 'blue'});
    mapManager.map.addLayer(mapManager.itinerary);
    mapManager.map.fitBounds(mapManager.itinerary.getBounds());

    var routes = {
      'time' : 0,
      'distance' : 0,
      'maneuvers' : []
    };

    var i;
    for (i = 0; i<instructions.length; i++) {
      var currentInstruction = instructions[i];
      routes.time += currentInstruction[4];
      routes.distance += currentInstruction[2]/1000.;
      var maneuver = {
        'time' :  currentInstruction[4],
        'distance' : currentInstruction[2]/1000.,
        'lat' : routeGeometry[currentInstruction[3]][0],
        'lon' : routeGeometry[currentInstruction[3]][1],
        'text' : currentInstruction[1],
        'icon' : ''
      };
      routes.maneuvers.push(maneuver);
    }

    return routes;

  };

  /**
   * Set the view of navitiaData
   * @param navitiaData
   */
  var navitiaJourneyView = function(navitiaData){
    var journeys = navitiaData.journeys;
    journeys.forEach(function(journey, index){

      var jDuration = routeTime(journey.duration);
      var jSteps = journey.sections.length;
      var jDep = navitiaTime(journey.departure_date_time);
      var jArr = navitiaTime(journey.arrival_date_time);

      var templateNavitia = templatesFunctions.getNavitia();
      var titleNavField = templateNavitia.querySelector('.journey-title');
      titleNavField.textContent = 'Journey n°' + (index+1) + ' - ' +jDuration;

      templateNavitia.querySelector('.jd-steps').textContent = 'Steps: ' + jSteps;
      templateNavitia.querySelector('.jd-dep').textContent = 'Departure time: ' + jDep;
      templateNavitia.querySelector('.jd-arr').textContent = 'ArrivalTime: ' + jArr;

      var sections = journey.sections;
      var sectionsDescriptor = '<ol>';
      sections.forEach(function(section) {
        sectionsDescriptor += '<li>';
        if(section.type === 'waiting'){
          sectionsDescriptor += '<i class="fa fa-street-view"></i> Wait ' + routeTime(section.duration);
        } else if(section.type === 'street_network' || section.type === 'transfer') {
          sectionsDescriptor += '<i class="fa fa-male"></i> Walk ' + routeTime(section.duration)
            + '<br/> From: <strong>' + section.from.name + '</strong>'
            + '<br/> To: <strong>' + section.to.name + '</strong>';
        } else if(section.type === 'public_transport') {
          sectionsDescriptor += '<i class="fa fa-train"></i> '+section.display_informations.physical_mode + ' '+ section.display_informations.label
            + '<br/> Direction: <strong>' + section.display_informations.direction + '</strong>'
            + '<br/> ' + navitiaTime(section.departure_date_time) +'-'+ navitiaTime(section.arrival_date_time)
            + '<br/> From: <strong>' + section.from.name + '</strong>'
            + '<br/> To: <strong>' + section.to.name + '</strong>'
            + '<br/> Duration: '+ routeTime(section.duration)
        }
        sectionsDescriptor += '</li>';
      });
      templateNavitia.querySelector('.journey-sections').innerHTML = sectionsDescriptor + '</ol>';

      containers.itineraryPanel.appendChild(templateNavitia);
      mapManager.utils.addClass(containers.closeItinerary, 'shown');
    });
  };

  /**
   * Search itinerary with from to latlng according to the current type
   * @param from
   * @param to
   */
  var searchItinerary = function(from, to) {

    //Clear description of route when asking new request
    containers.itineraryPanel.textContent = '';

    var fromStr = '';
    var toStr = '';

    if(currentItiType === 'iti-type-bus'){

      fromStr = from[1] + ';' + from[0];
      toStr = to[1] + ';' + to[0];
      var dateTime = navitiaDate(new Date());

      MapManager.callHttpReq('GET',
        'http://api.navitia.io/v1/journeys?from='+fromStr+'&to='+toStr+'&datetime='+dateTime,
        { 'Authorization' : '82b082ec-424c-4e84-ac51-3d499d575be1'})
        .success(navitiaJourneyView);
    } else {

      fromStr = from[0] + ',' + from[1];
      toStr = to[0] + ',' + to[1];

      var request = "http://router.project-osrm.org/viaroute?loc="+fromStr+"&loc="+toStr+"&instructions=true";

      MapManager.callHttpReq('GET', request).success(function(data) {
        routeView(data, getOSRMData);
      });

    }
  };

  /*------------------------------------------------------------------*/
  /*------------------- Simple search management --------------------*/
  /*----------------------------------------------------------------*/

  /**
   * Show a searched location and bind the click
   * @param searchItem
   */
  var showSearchItem = function(searchItem) {
    // Add the template in the view
    var notVisible = false;
    if (searchItem.internal) {
      for (var i = 0; i < mapManager.conf.points.length && !notVisible; i++) {
        if (!mapManager.conf.points[i].enable && mapManager.conf.points[i].name === searchItem.name) {
          notVisible = true;
        }
      }
    }
    var searchElemClone = templatesFunctions.getField(notVisible);
    searchElemClone.querySelector('.name').textContent = searchItem.name;
    containers.results.appendChild(searchElemClone);

    // Bind the new elem for click (need to search the last .search-elem created)
    var searchElemJS = document.querySelectorAll('.search-elem');
    var lastElem = searchElemJS[searchElemJS.length-1];

    lastElem.addEventListener("click", function(){ clickOnResult(searchItem); } );
  };

  /**
   * Event when clicking on a searched item
   * @param searchItem
   */
  var clickOnResult = function(searchItem) {
    if(!searchItem) {
      return false;
    }


    if(searchItem.bounds) {
      mapManager.map.fitBounds(searchItem.bounds);
    } else {
      mapManager.map.setView(searchItem.latlng, mapManager.conf.maxZoom - 3);
    }

    if(searchMarker) {
      mapManager.map.removeLayer(searchMarker);
      searchMarker = null;
    }
    if(!searchItem.internal) {
      searchMarker = new L.marker(searchItem.latlng);
      mapManager.map.addLayer(searchMarker);
    }


    currentSearchField.value = searchItem.name;
    currentSearchField.latlng = searchItem.latlng;
    currentSearchField.bounds = searchItem.bounds;
    containers.results.textContent = '';

    var itiItem = mainItem.querySelector('.itinerary-search');
    var locItem = mainItem.querySelector('.map-search');

    if(!itiItem) {
      showItinerary(true);
      itiItem = mainItem.querySelector('.itinerary-search');
    }

    if(itiItem.value && locItem.value) {
      searchItinerary(locItem.latlng, itiItem.latlng);
    }

    var parent = currentSearchField.parentNode;
    var focusBtn = parent.querySelector('.eye-btn');
    var delBtn = parent.querySelector('.del-btn');

    mapManager.utils.addClass(focusBtn, 'shown');
    mapManager.utils.addClass(delBtn, 'shown');

    focusBtn.parentField = delBtn.parentField = currentSearchField; // sibling search field

    focusBtn.addEventListener('click', function(){
      if(this.parentField.bounds) {
        mapManager.map.fitBounds(this.parentField.bounds);
      } else {
        mapManager.map.setView(this.parentField.latlng, mapManager.conf.maxZoom);
      }

      if(searchMarker) {
        mapManager.map.removeLayer(searchMarker);
        searchMarker = null;
      }

      if(!searchItem.internal) {
        searchMarker = new L.marker(this.parentField.latlng);
        mapManager.map.addLayer(searchMarker);
      }

    });

    delBtn.addEventListener('click', function(){
      this.parentField.value = '';

      mapManager.utils.removeClass(focusBtn, 'shown');
      mapManager.utils.removeClass(delBtn, 'shown');

      if(searchMarker) {
        mapManager.map.removeLayer(searchMarker);
        searchMarker = null;
      }

      if(mapManager.itinerary) {
        mapManager.map.removeLayer(mapManager.itinerary);
        mapManager.itinerary = null;
      }

      if(locItem === this.parentField) {
        containers.itinerary.textContent = '';
      }

    });
  };

  /*------------------------------------------------------------------*/
  /*-------------------------- Listeners ----------------------------*/
  /*----------------------------------------------------------------*/

  var showSearchResults = function(acceptFirst) {
    if(photonRequest) {
      photonRequest.abort();
    }

    if(gouvRequest) {
      gouvRequest.abort();
    }

    var photonSearch = [];
    var gouvSearch = [];

    var endSearch = function() {

      // Filter and map points to be readable on the view
      var pointsSearch = mapManager.conf.points.filter(
        function(currentPoint){
          var name = currentPoint.name.toLowerCase();
          var value = currentSearchField.value.toLowerCase();
          return name.indexOf(value) >= 0 && value !== '';
        }).map(mapPoints);
      var searchTab = pointsSearch.concat(gouvSearch).concat(photonSearch);

      // Clean the search results
      containers.results.textContent = '';

      if(acceptFirst) {
        clickOnResult(searchTab[0]);
      } else {
        searchTab.forEach(function(item){
          showSearchItem(item);
        });
      }

    };

    var callGouvRequest = function() {
      if(currentSearchField.value.length > 0) {
        MapManager.callHttpReq('GET', 'http://api-adresse.data.gouv.fr/search/?q='+currentSearchField.value)
          .success(function(gouvResult) {
            gouvSearch = gouvResult.features.map(mapGouv);
          }).then(endSearch);
      } else {
        endSearch();
      }
    };

    if(currentSearchField) {
      if(mapManager.conf.widgetConf.osmSearch) {
        photonRequest = MapManager.callHttpReq('GET', 'http://photon.komoot.de/api/?q='+currentSearchField.value)
          .success(function(photonResult) {
            photonSearch = photonResult.features.map(mapPhoton);
          }).then(callGouvRequest);
      } else {
        endSearch();
      }
    }
  };

  /**
   * Bind the keyup on search textfields
   */
  var keyupEvent = function(e) {
    currentSearchField = this;
    var acceptFirst = e.which == 13 || e.which == 9;

    if(textLength != currentSearchField.value.length) {
      if (currentSearchField.value.length === 0) {
        containers.results.textContent = '';
      } else {
        showSearchResults(acceptFirst);
      }
    }

    textLength = currentSearchField.value.length;
  };

  var launchSearchElem = mainItem.querySelector('.search-widget-button');
  launchSearchElem.addEventListener("click", function() {
    if(mapManager.searchWidgetOpen) {
      showSearchResults(true);
    } else {
      mapManager.toggleSearchWidgetOpen();
    }
  });


  // Bind the search field

  var mapSearchElem = mainItem.querySelector('.map-search');
  mapSearchElem.addEventListener("keyup", keyupEvent, false);
  mapSearchElem.addEventListener("click", function() {
    showSearchResults();
  } );


  mapManager.map.on('click', function(){
    containers.results.textContent = '';
  });

  /*------------------------------------------------------------------*/
  /*----------------------- Utils functions -------------------------*/
  /*----------------------------------------------------------------*/

  /**
   * Transform a number (in seconds) to a readable number in minutes or hours
   * @param number
   * @returns {number}
   */
  var routeTime = function(number) {
    var time = +number / 60.; //Parsing in minutes
    if(time > 60) {
      var hour = Math.floor(time/60);
      var min = Math.floor(time%60);
      if(min < 10){
        min = '0'+min;
      }
      time = hour + 'h' + min + 'min';
    } else {
      time = Math.round(time) + 'min';
    }

    return time;
  };

  /**
   * Transform a number into distance readable view
   * @param number
   * @returns {string}
   */
  var routeDistance = function(number) {
    if(+number < 1){
      return Math.round(+number*1000)+'m';
    }else if(+number < 10){
      return (Math.round(+number*10)/10)+'km';
    }else {
      return Math.round(+number)+'km'
    }
  };

  /**
   * Put a zero before one char numbers
   * @param num
   * @returns {string}
   */
  var convertTime = function(num) {
    if(num < 10) {
      return '0'+num;
    } else {
      return ''+num;
    }
  };

  /**
   * Convert a date to be readable by navitia api YYYYMMDDThhmmss
   * @param date
   * @returns {string}
   */
  var navitiaDate = function(date) {
    var month = convertTime(date.getMonth()+1);
    var day = convertTime(date.getDate());
    var hours = convertTime(date.getHours());
    var minutes = convertTime(date.getMinutes());

    return '' + date.getFullYear() + month + day + 'T' + hours + minutes;
  };

  /**
   * Transform a navitia duration to be readable
   * @param date
   * @returns {string}
   */
  var navitiaTime = function(date) {
    if(date) {
      var time = date.split('T')[1];
      var hour = time.substring(0,2);
      var minutes = time.substring(2,4);
      return hour+'h'+minutes;
    }
    return '';
  };

};