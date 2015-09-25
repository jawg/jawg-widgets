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
MapManager.widget['markers-widget'] = function(mapManager) {

  if (mapManager.conf.points.length === 0) {
    return;
  }

  var savedZoom = mapManager.map.getZoom();
  var popup;

  var position = mapManager.conf.widgetConf.panelPosition;
  var poiPanel = document.createElement('div');
  var poiContent = document.createElement('div');
  var map = mapManager.rootElement.querySelector('.map-content');

  var selectedPoint = null;
  var mode = 'list';

  function filterFields(obj) {
    return function(key, value) {
      if (key === 'marker') {
        return '';
      }
      return value;
    }
  }

  var findIn = function(str, obj) {
    if (obj) {
      str = str.toLowerCase();
      var strObj = JSON.stringify(obj, filterFields(obj)).toLowerCase();
      return strObj.indexOf(str) >= 0;
    } else {
      return false;
    }
  };

  var initWidget = function() {
    poiPanel.setAttribute('class', 'poi-widget-panel' + ' panel-' + position);
    poiContent.setAttribute('class', 'poi-widget-panel-content');

    mapManager.rootElement.appendChild(poiPanel);

    var showPanelBtn = document.createElement('div');
    showPanelBtn.setAttribute('class', 'poi-widget-show-btn');

    var poiContainer = document.createElement('div');
    poiContainer.setAttribute('class', 'poi-widget-container');


    var showPanelBtnIcon = document.createElement('i');
    showPanelBtnIcon.setAttribute('class', 'fa fa-chevron-left');


    showPanelBtn.appendChild(showPanelBtnIcon);
    poiPanel.appendChild(showPanelBtn);
    poiContainer.appendChild(poiContent);
    poiPanel.appendChild(poiContainer);

    mapManager.markersWidgetOpen = false;
    mapManager.toggleMarkersWidgetOpen = function(){
      mapManager.utils.addClass(mapManager.rootElement, 'markers-' + position);
      mapManager.utils.addClass(map, 'markers-' + position);

      if (position === 'left') {
        showPanelBtnIcon.setAttribute('class', 'fa fa-chevron-left');
      } else if (position === 'right') {
        showPanelBtnIcon.setAttribute('class', 'fa fa-chevron-right');
      } else if (position === 'bottom') {
        showPanelBtnIcon.setAttribute('class', 'fa fa-chevron-down');
      } else if (position === 'top') {
        showPanelBtnIcon.setAttribute('class', 'fa fa-chevron-up');
      }

      if (mapManager.markersWidgetOpen) {
        mapManager.markersWidgetOpen = false;
        poiPanel.setAttribute('class', 'poi-widget-panel' + ' panel-' + position + ' poi-panel-close');
      } else {
        mapManager.markersWidgetOpen = true;
        poiPanel.setAttribute('class', 'poi-widget-panel' + ' panel-' + position + ' poi-panel-open');

        if (mapManager.searchWidgetOpen != null && mapManager.searchWidgetOpen !== undefined) {
          mapManager.searchWidgetOpen = true;
          mapManager.toggleSearchWidgetOpen();
        }
        if (mapManager.toggleLayerMenu && mapManager.layerMenuOpened) {
          mapManager.toggleLayerMenu();
        }

      }
      setTimeout(function() { mapManager.map.invalidateSize(true) }, 300);
    };

    showPanelBtn.addEventListener('click', mapManager.toggleMarkersWidgetOpen);
    mapManager.markersWidgetOpen = !mapManager.markersWidgetOpen;

    mapManager.toggleMarkersWidgetOpen()


  };

  mapManager.map.on('moveend', function(){
    if (mode === 'list') {
      modeList();
    }
  });

  var modePoi = function() {
    mode = 'list';
    poiContent.textContent = '';

    var point = selectedPoint;
    var type = point.typeItem;



    var poiHeader = document.createElement('div');
    poiHeader.setAttribute('class', 'poi-widget-header');
    var pointPan = document.createElement('div');
    pointPan.setAttribute('class', 'poi-widget-point-pan');

    var pointPanBack = document.createElement('div');
    pointPanBack.setAttribute('class', 'poi-widget-point-pan-back');

    var pointPanBackIcon = document.createElement('i');
    pointPanBackIcon.setAttribute('class', 'fa fa-arrow-circle-left');

    //var pointPanBackSpan = document.createElement('span');
    //pointPanBackSpan.textContent = ' Go back to list.';

    var pointPanHead = document.createElement('div');
    pointPanHead.setAttribute('class', 'poi-widget-point-pan-head');

    var pointPanDetails = document.createElement('div');
    pointPanDetails.setAttribute('class', 'poi-widget-point-pan-details');

    var pointElemPictureContainer = document.createElement('div');
    pointElemPictureContainer.setAttribute('class', 'poi-widget-point-pan-head-pic');

    var pointElemPicture = document.createElement('img');
    if (type.icon) {
      pointElemPicture.setAttribute('src', point.iconUrl);
    }

    var pointElemName = document.createElement('div');
    pointElemName.setAttribute('class', 'poi-widget-point-pan-name');

    var pointElemNameSpan = document.createElement('span');
    pointElemNameSpan.textContent = point.name;

    pointPanBack.appendChild(pointPanBackIcon);
    pointPan.appendChild(pointPanBack);

    pointElemPictureContainer.appendChild(pointElemPicture);
    pointPanHead.appendChild(pointElemPictureContainer);
    pointElemName.appendChild(pointElemNameSpan);

    poiHeader.appendChild(pointPanBack);
    poiHeader.appendChild(pointElemName);

    pointPan.appendChild(pointPanHead);
    pointPan.appendChild(pointPanDetails);
    poiContent.appendChild(poiHeader);
    poiContent.appendChild(pointPan);


    var valuesKey = Object.keys(point.fields);

    if (valuesKey) {
      valuesKey.forEach(function(value, index){
        if (value && point.fields[value] && point.fields[value].length > 0) {
          var valueElem = document.createElement('div');
          var valueUp = value.charAt(0).toUpperCase() + value.slice(1);
          valueElem.textContent = valueUp +' : '+ point.fields[value];
          pointPanDetails.appendChild(valueElem);
        }
      });
    }


    // CLICK ON BACK BUTTON
    pointPanBack.addEventListener('click', function(){
      if (savedZoom < mapManager.map.getZoom()) {
        mapManager.map.setZoom(savedZoom);
      }
      if (popup) {
        mapManager.map.closePopup();
      }
      modeList();
    });
  };


  var searchingStr = '';
  var searchItems = null;

  var showList = function() {

    var shownBounds = mapManager.map.getBounds();

    var i = 0;

    mapManager.conf.points.forEach( function(point) {
      var type = point.typeItem;


      if (shownBounds.contains(point.latLngTable) && point.enable && type && findIn(searchingStr, point)) {

        if (i < 100) {

          var pointElem = document.createElement('div');
          pointElem.setAttribute('class', 'poi-widget-point');
          pointElem.point = point;

          var pointElemPictureContainer = document.createElement('div');
          pointElemPictureContainer.setAttribute('class', 'poi-widget-point-pic');
          pointElem.appendChild(pointElemPictureContainer);

          var pointElemPicture = document.createElement('img');
          if (type && type.icon) {
            pointElemPicture.setAttribute('src', point.iconUrl);
          }
          pointElemPictureContainer.appendChild(pointElemPicture);

          var pointElemRight = document.createElement('div');
          pointElemRight.setAttribute('class', 'poi-widget-point-right');
          pointElem.appendChild(pointElemRight);

          var pointElemName = document.createElement('span');
          pointElemName.setAttribute('class', 'poi-widget-point-name');
          pointElemName.textContent = point.name;
          pointElemRight.appendChild(pointElemName);

          var values = point.values;

          searchItems.appendChild(pointElem);

          // ADD EVENT ON PANEL BUTTONS
          pointElem.addEventListener('click', function(){
            savedZoom = mapManager.map.getZoom();
            mapManager.map.setView(this.point.latLng, mapManager.conf.maxZoom);
            point.marker.openPopup();
            selectedPoint = this.point;

            popup = L.popup().setContent(pointElem.point.name);
            pointElem.point.marker.bindPopup(popup);
            pointElem.point.marker.openPopup();

            modePoi();
            if (!mapManager.markersWidgetOpen) {
              mapManager.toggleMarkersWidgetOpen();
            }

          });

        }

        i++;


        // ADD EVENT ON MARKERS
        if (mapManager.conf.widgetConf.clickMarker) {
          point.marker.removeEventListener('click');
          point.marker.on('click', function(){
            savedZoom = mapManager.map.getZoom();
            mapManager.map.setView(point.latLngTable, mapManager.conf.maxZoom);
            selectedPoint = point;

            popup = L.popup().setContent(point.name);
            point.marker.bindPopup(popup);
            point.marker.openPopup();

            modePoi();
            if (!mapManager.markersWidgetOpen) {
              mapManager.toggleMarkersWidgetOpen();
            }
          });
        }
      }
    });

    if (i >= 100) {
      var limitElem = document.createElement('div');
      limitElem.style.padding = '10px';
      limitElem.style.fontSize = '12px';
      limitElem.textContent = '100 points on ' + i +' shown, specify more criterias.';
      searchItems.appendChild(limitElem);
    }

    if (poiContent.textContent.length === 0) {
      searchItems.textContent = "You have no points available here, move the map to find one.";
      searchItems.style.padding = '10px';
      searchItems.style.boxSizing = 'border-box';
    } else {
      searchItems.style.padding = '0px';
      searchItems.style.boxSizing = 'auto';
    }

  };

  var modeList = function() {

    mode = 'list';
    poiContent.textContent = '';

    var searchPoi = document.createElement('div');
    searchPoi.className = 'poi-widget-search';
    searchPoi.innerHTML =
      '<input type="text"/>' +
      '<div class="search-icon">' +
      '<i class="fa fa-search"></i>' +
      '</div>';
    poiContent.appendChild(searchPoi);

    searchItems = document.createElement('div');
    searchItems.className = 'poi-widget-list-search';
    poiContent.appendChild(searchItems);

    var search = searchPoi.querySelector('input');
    search.value = searchingStr;
    search.addEventListener('keyup', function(){
      searchingStr = this.value;
      searchItems.innerHTML = '';
      showList();
    });

    showList();

  };

  initWidget();
  modeList();
};