const GLib = imports.gi.GLib;
const ShellToolkit = imports.gi.St;

const Main = imports.ui.main;

let main_container_properties = { style_class: 'panel-button', reactive: true };
let main_container = new ShellToolkit.Bin(main_container_properties);

let main_container_content = new ShellToolkit.Label({ text: _get_local_ip() });
let main_container_content_updater = function() { main_container_content.set_text(_get_local_ip()); };

function _get_local_ip()
{
	var command_output_bytes = GLib.spawn_command_line_sync('ip route list default | grep -Eo "src (([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|([0-9]{1,3}\.){3}[0-9]{1,3})" | cut -d" " -f2')[1];
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
