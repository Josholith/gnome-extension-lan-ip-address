
/*
	Copyright (C) 2016 kalterfive

	This file is part of ipshower@kalterfx-gmail.com

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const GLib = imports.gi.GLib;
const ShellToolkit = imports.gi.St;

const Main = imports.ui.main;

let main_container_properties = { style_class: 'panel-button', reactive: true };
let main_container = new ShellToolkit.Bin(main_container_properties);

let main_container_content = new ShellToolkit.Label({ text: _get_local_ip() });
let main_container_content_updater = function() { main_container_content.set_text(_get_local_ip()); };

function _get_local_ip()
{
	var command_output_bytes = GLib.spawn_command_line_sync('hostname -i')[1];
	var command_output_string = '';

	for (var current_character_index = 0;
	     current_character_index < command_output_bytes.length;
	     ++current_character_index)
	{
		var current_character = String.fromCharCode(command_output_bytes[current_character_index]);
		command_output_string += current_character;
	}

	// ditch new line escape sequence from the string
	return command_output_string.substring(0, command_output_string.length - 1);
}

function init()
{
	main_container.set_child(main_container_content);
	main_container.connect('button-press-event', main_container_content_updater);
}

function enable()
{
	Main.panel._rightBox.insert_child_at_index(main_container, 0);
}

function disable()
{
	Main.panel._rightBox.remove_child(main_container);
}
