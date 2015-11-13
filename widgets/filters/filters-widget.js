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
MapManager.widget['filters-widget'] = function(mapManager) {

  if (mapManager.conf.types.length < 2) {
    return;
  }

  var mapContainerElem;
  var filterContainer;

  var filterClones = []; // DocumentFragment array of cloned templates

  var initTypeTemplates = function() {
    filterContainer = document.createElement('div');
    filterContainer.setAttribute('class', 'filters');

    mapContainerElem = mapManager.rootElement.querySelector('.map-content');
    mapContainerElem.appendChild(filterContainer);
  };

  var getFiltersWidgetElement = function() {

    var filterElem = document.createElement('div');
    filterElem.className = 'filter clickable checked';

    var filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';

    var filterText = document.createElement('span');
    filterText.className = 'filter-content';

    filterContainer.appendChild(filterText);
    filterElem.appendChild(filterContainer);

    return filterElem;
  };

  var createTypeButtons = function() {

    // Creation
    for (var i = 0; i < mapManager.conf.types.length; i++) {
      filterClones.push(getFiltersWidgetElement());
      filterContainer.appendChild(filterClones[i]);
      var list = filterContainer.querySelectorAll('.filter');
      var current = list[list.length - 1];
      current.addEventListener('click', toggleSelect);
      current.checked = true;
    }

    // Set content
    var filterContents = filterContainer.querySelectorAll('.filter-content');
    for (var j = 0; j < filterContents.length; j++) {
      filterContents[j].textContent = mapManager.conf.types[j].name;
    }

    // Set checked
    var filterChecked = filterContainer.querySelectorAll('.filter-checked');
    for (var k = 0; k < filterChecked.length; k++) {
      filterChecked[k].className = 'fa fa-check-square-o';
    }
  };

  var toggleSelect = function() {
    var toggle = true;
    if (this.checked) {
      var checkedLength = filterClones.filter(function(clone) {
        return clone.checked;
      }).length;
      toggle = checkedLength > 1;
    }

    if (toggle) {
      this.checked = !this.checked;
      if (this.checked) {
        this.className = 'filter clickable checked';
      } else {
        this.className = 'filter clickable';
      }
    } else {
      filterClones.forEach(function(clone) {
        clone.checked = !clone.checked;
        if (clone.checked) {
          clone.className = 'filter clickable checked';
        } else {
          clone.className = 'filter clickable';
        }
      });
    }

    refreshMap();

    mapManager.map.fireEvent('moveend');
  };

  var refreshMap = function() {
    var shownTypes = [];
    filterClones.forEach(function(clone) {
      if (clone.checked) {
        var type = clone.querySelector('span').textContent;
        if (shownTypes.indexOf(type) < 0 ) {
          shownTypes.push(type);
        }
      }
    });

    var displayMarker = 1;
    mapManager.conf.points.forEach(function(point) {
      if (mapManager.layersActivated) {
        var zooms = mapManager.activatedZooms(point);
        displayMarker = 0;

        if (point.layers && mapManager.checkedLayers && zooms) {
          if (mapManager.map.getZoom() >= zooms.min && mapManager.map.getZoom() <= zooms.max) {
            displayMarker += 1;
          }
        } else if (!point.layers) {
          displayMarker += 1;
        }
      }

      mapManager.map.markerGroup.removeLayer(point.marker);
      point.enable = false;
      point.typeItem.enable = false;
      if (shownTypes.indexOf(point.typeItem.name) >= 0) {
        point.typeItem.enable = true;
        if (displayMarker > 0) {
          mapManager.map.markerGroup.addLayer(point.marker);
          point.enable = true;
        }
      }
    });
  };

  initTypeTemplates();
  createTypeButtons();
};