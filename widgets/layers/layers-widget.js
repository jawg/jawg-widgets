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
MapManager.widget['layers-widget'] = function(mapManager) {

  var mapSample = mapManager.rootElement;
  mapManager.checkedLayers = [];
  mapManager.layersActivated = true;
  mapManager.layerMenuOpened = false;

  mapManager.activatedZooms = function(elem) {
    var activated = false;
    var zooms = {min:100, max:-1};
    if (!elem.layers) {
      zooms = {min: mapManager.conf.minZoom, max: mapManager.conf.maxZoom};
      activated = true;
    } else {
      for (var i = 0; i < mapManager.checkedLayers.length; i++) {
        if (elem.layers && mapManager.utils.contains(elem.layers, mapManager.checkedLayers[i].id)) {
          activated = true;
          if (mapManager.checkedLayers[i].minZoom < zooms.min) {
            zooms.min = mapManager.checkedLayers[i].minZoom;
          }
          if (mapManager.checkedLayers[i].maxZoom > zooms.max) {
            zooms.max = mapManager.checkedLayers[i].maxZoom;
          }
        }
      }
    }
    if (activated) {
      return zooms;
    } else {
      return null;
    }
  };

  /**
   * Refresh the map according to elements to display
   */
  var refreshMap = function() {

    // Points
    var elem;
    var zooms;
    var remove;
    for (var i = 0; i < mapManager.conf.points.length; i++) {
      elem =  mapManager.conf.points[i];
      zooms = mapManager.activatedZooms(elem);
      if (elem.typeItem.enable && zooms) {
        elem.enable = mapManager.map.getZoom() >= zooms.min && mapManager.map.getZoom() <= zooms.max;
      } else {
        elem.enable = false;
      }
      if (mapManager.map.markerGroup.hasLayer(elem.marker)) {
        if (!elem.enable) {
          mapManager.map.markerGroup.removeLayer(elem.marker);
        }
      } else {
        if (elem.enable) {
          mapManager.map.markerGroup.addLayer(elem.marker);
        }
      }
    }

    // Tracks
    for (var j = 0; j < mapManager.conf.tracks.length; j++) {
      remove = false;
      elem =  mapManager.conf.tracks[j];
      zooms = mapManager.activatedZooms(elem);
      if (zooms) {
        if (mapManager.map.getZoom() >= zooms.min && mapManager.map.getZoom() <= zooms.max) {
          if (!mapManager.traces.hasLayer(elem.polyline)) {
            mapManager.traces.addLayer(elem.polyline);
          }
        } else {
          remove = true;
        }
      } else {
        remove = true;
      }
      if (remove) {
        if (mapManager.traces.hasLayer(elem.polyline)) {
          mapManager.traces.removeLayer(elem.polyline);
        }
      }
    }

    // Areas
    for (var k = 0; k < mapManager.conf.areas.length; k++) {
      remove = false;
      elem =  mapManager.conf.areas[k];
      zooms = mapManager.activatedZooms(elem);
      if (zooms) {
        if (mapManager.map.getZoom() >= zooms.min && mapManager.map.getZoom() <= zooms.max) {
          if (!mapManager.areas.hasLayer(elem.polygon)) {
            mapManager.areas.addLayer(elem.polygon);
          }
        } else {
          remove = true;
        }
      } else {
        remove = true;
      }
      if (remove) {
        if (mapManager.areas.hasLayer(elem.polygon)) {
          mapManager.areas.removeLayer(elem.polygon);
        }
      }
    }
  };

  mapManager.toggleLayerMenu = function() {
    mapManager.layerMenuOpened = !mapManager.layerMenuOpened;
    mapManager.utils.toggleClass(mapManager.layerMenuButton, 'opened');
    mapManager.utils.toggleClass(mapManager.layerMenu, 'opened');
    if (mapManager.utils.hasClass(mapManager.layerMenu, 'overflow-auto')) {
      mapManager.utils.removeClass(mapManager.layerMenu, 'overflow-auto');
    } else {
      setTimeout(function() {
        mapManager.utils.addClass(mapManager.layerMenu, 'overflow-auto');
      }, 200);
    }
  };

  var initWidget = function() {
    mapManager.layerMenuButton = document.createElement('div');

    // Init zoom event on the map
    mapManager.map.on('zoomend', function() {
      refreshMap();
    });

    var layerClickEvent = function(layer) {
      // Fill an array of checked layers
      var layerFound =false;
      if (layer.checked) {
        mapManager.checkedLayers.push(layer.layerElement);
      } else {
        for (var i = 0; i < mapManager.checkedLayers.length && !layerFound; i++) {
          if (mapManager.checkedLayers[i] === layer.layerElement) {
            layerFound = true;
            mapManager.checkedLayers.splice(i, 1);
          }
        }
      }

      refreshMap();
    };

    var setLayerClass = function(domLayerInput) {
      if (domLayerInput.checked) {
        mapManager.utils.addClass(domLayerInput.parentNode, 'activated');
      } else {
        mapManager.utils.removeClass(domLayerInput.parentNode, 'activated');
      }
    };

    mapManager.layerMenuButton.className = 'layer-button';
    mapManager.layerMenuButton.innerHTML = '<i class="fa fa-clone"></i>';
    mapSample.appendChild(mapManager.layerMenuButton);

    mapManager.layerMenu = document.createElement('div');
    mapManager.layerMenu.className = 'layer-menu';

    mapManager.layerMenuButton.addEventListener('click', function() {
      mapManager.toggleLayerMenu();
      if (mapManager.searchWidgetOpen) {
        mapManager.searchWidgetOpen = true;
        mapManager.toggleSearchWidgetOpen();
      }
      if (mapManager.searchWidgetOpen) {
        mapManager.searchWidgetOpen = true;
        mapManager.toggleSearchWidgetOpen();
      }
    });

    for (var i = 0; i < mapManager.conf.layers.length; i++) {
      var layer = document.createElement('div');
      var layerInput = document.createElement('input');
      var layerLabel = document.createElement('label');

      layer.className = 'layer';
      layer.addEventListener('click', function() {
        var input = this.getElementsByTagName('input')[0];
        input.click();
        layerClickEvent(input);
      });

      layerInput.layerElement = mapManager.conf.layers[i];
      layerInput.setAttribute('type', 'checkbox');
      layerInput.setAttribute('checked', '');
      layerInput.checked = mapManager.conf.layers[i].enabled;
      if (mapManager.conf.layers[i].enabled) {
        mapManager.checkedLayers.push(mapManager.conf.layers[i]);
      }
      layerInput.addEventListener('change', function() {
        setLayerClass(this);
      });
      layer.appendChild(layerInput);
      setLayerClass(layerInput);

      layerLabel.innerHTML = mapManager.conf.layers[i].name;
      layer.appendChild(layerLabel);

      mapManager.layerMenu.appendChild(layer);
    }

    mapSample.appendChild(mapManager.layerMenu);

    // Load elements filtered by layers zoom
    refreshMap();
  };

  initWidget();
};
