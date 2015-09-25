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

MapManager.widget['background-widget'] = function(mapManager) {
  var body = document.body;
  mapManager.conf.widgetConf.backgroundName = mapManager.conf.widgetConf.backgroundName.replace(/ /g, '\\ ').replace(/'/g, '\\\'').replace(/"/g, '\\\"');
  body.style.background = "url('"+mapManager.conf.widgetConf.backgroundName+"')";
  body.style.backgroundSize = 'cover';
};