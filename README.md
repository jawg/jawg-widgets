##MapSquare Widgets
===================

OpenSource Javascript widgets for OpenStreetMap maps.  
This Library allows you to make a seamless integration of a map on your websites.  
It uses the latest User Experience guidelines and best practices, and does not require coding skills for integartion.  

----------
A video of the widgets in action is available on youtube:  
https://www.youtube.com/watch?v=W7HanELqEKo


Widgets
-------------

The base script contains the basic map. This map can be combined with other widgets:

Widgets are used to add more features on your map according to your needs.
You can find 5 widgets : markers, search, filters, layers and background.



Screenshots
-------------

![Base map widget](/images/widget-emptyx400.png)
![Filters widget](/images/widget-filters-layersx400.png)  
![Markers widget](/images/widget-search-markersx400.png)
![Full widget](/images/widget-fullx400.png)


To enable the widgets, you need to call the callMap function in the MapManager object (in the mapSample.js) with 3 arguments : 
>- The ID of the HTML element to inject the map to
>- A map configuration object
>- An array of available widgets (corresponding to the name of the javascript file)

```
Example : 

MapManager.callMap('map-sample', mapConf, [
		"search-widget",
	    "filters-widget",
	    "markers-widget",
	    "background-widget",
	    "layers-widget"
]);
```

Here is an example of the mapConf object with default values : 
```
var mapConf = {
	"tileServer": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	"poiServer": null,
	"mapBounds": [[85, -180], [-65, 180]],
	"widgetConf": {
		"panelPosition": "left",
		"clickMarker": false,
		"osmSearch": false,
		"backgroundName": null
	},
	"minZoom": 3,
	"maxZoom": 18,
	"initialZoom": 3,
	"initialLocation": [0, 0],
	"fitBounds": null,
	"clusterMaxLevel": 18
};
```

Attributes :
>- tileServer: The generic URL for the tile server
>- poiServer: The URL for the POI server
>- mapBounds: The bounds of the map in which the user can navigate
>- widgetConf: The configuration for the widgets
>- panelPosition: The position of the [markers widget](#markers-widget) panel (right, left, top, bottom)
>- clickMarker: Enable or not the click on points for the [markers widget](#markers-widget)
>- osmSearch:  Enable or not the OSM search APIs for the [search widget](#search-widget)
>- backgroundName: The name of the background image for the [background widget](#background-widget)
>- minZoom: The map minimum possible zoom
>- maxZoom: The map maximum possible zoom
>- initialZoom: The starting zoom on the map
>- initialLocation: The starting location on the map
>- fitBounds: The map bounds in which the user can navigate
>- clusterMaxLevel: The maximum zoom level for clustering


-------

#### Search widget

This widget let you search different things on your map. You can find all your points by their name. You can also find all places referenced by https://adresse.data.gouv.fr and  http://photon.komoot.de.
The search widget can be used to create itinaries between two points thanks to http://map.project-osrm.org/ and http://www.navitia.io/ APIs.

> **Note:**

> All points are searchable but you can only see visible points on the map (see  [filters widget](#filters-widget) and [layers widget](#layers-widget)).

----------

#### Filters widget

Filters widget is used to ... filter your points by their type. Only points whith their type activated will be visible on the map. At least one type must be activated.

----------

#### Layers widget

Layers widget is another way to filter elements on your map. You can associate points, tracks and areas with different layers.

> **Example:**

> A layer for a subway : if this layer is activated, all points/areas/tracks associated to this layer will be displayed on the map.

---

#### Markers widget

Markers widget is a display panel for all visible points on the map. You can focus on a point by clicking on it and display its details.

---

#### Background widget

The background widget simply add a background image to your website.

---

**Licence**
===========
Copyright (C) 2000-2015 eBusiness Information
 
 This file is part of MapSquare Widgets.
 
 MapSquare Widgets is free software: you can redistribute it and/or modify it under the terms of the GNU  General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 
MapSquare Widgets is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License along with MapSquare Widgets.  If not, see <http://www.gnu.org/licenses/>.

**Contributors**
===========
jasonconard  
anthonysalembier
