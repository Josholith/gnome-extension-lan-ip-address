const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const ShellToolkit = imports.gi.St;

// Start with IPv4 LAN address as default
var type=4;

function _get_lan_ip4() {
    // Ask the IP stack what route would be used to reach 1.1.1.1 (Cloudflare DNS)
    // Specifically, what src would be used for the 1st hop?
    var command_output_bytes = GLib.spawn_command_line_sync('ip route get 1.1.1.1')[1];
    var command_output_string = '';

    for (var current_character_index = 0;
        current_character_index < command_output_bytes.length;
        ++current_character_index)
    {
        var current_character = String.fromCharCode(command_output_bytes[current_character_index]);
        command_output_string += current_character;
    }

    // Output of the "ip route" command will be a string
    // " ... src 1.2.3.4 ..."
    // So basically we want the next token (word) immediately after the "src"
    // word, and nothing else. This is considerd our LAN IP address.
    var Re = new RegExp(/src [^ ]+/g);
    var matches = command_output_string.match(Re);
    var lanIpAddress;
    if (matches) {
        lanIpAddress = matches[0].split(' ')[1];
    } else {
        lanIpAddress = '';
    }

    return lanIpAddress;
}

function _get_lan_ip6() {
    // Ask the IP stack what route would be used to reach 2001:: (random ipv6 address)
    // Specifically, what src would be used for the 1st hop?
    var command_output_bytes = GLib.spawn_command_line_sync('ip route get 2001::')[1];
    var command_output_string = '';

    for (var current_character_index = 0;
        current_character_index < command_output_bytes.length;
        ++current_character_index)
    {
        var current_character = String.fromCharCode(command_output_bytes[current_character_index]);
        command_output_string += current_character;
    }

    // Output of the "ip route" command will be a string
    // " ... src 2001:xxx:yyy:..."
    // So basically we want the next token (word) immediately after the "src"
    // word, and nothing else. This is considerd our LAN IP address.
    var Re = new RegExp(/src [^ ]+/g);
    var matches = command_output_string.match(Re);
    var lanIpAddress;
    if (matches) {
        lanIpAddress = matches[0].split(' ')[1];
    } else {
        lanIpAddress = '';
    }
    return lanIpAddress;
}

function _get_wan_ip4() {
    // Use the google dns servers to find the publip ip address used for requests
    // Force a ipv4 conection, because ipv6 won't be NAT'ed
    var command_output_bytes = GLib.spawn_command_line_sync('dig TXT +short o-o.myaddr.l.google.com @ns1.google.com -4')[1];
    var command_output_string = '';

    for (var current_character_index = 0;
        current_character_index < command_output_bytes.length;
        ++current_character_index)
    {
        var current_character = String.fromCharCode(command_output_bytes[current_character_index]);
        command_output_string += current_character;
    }
    command_output_string=command_output_string.replace('"','').replace('"','').replace('\n','');
    // Validate the result looks like an ipv4 address
    var Re = new RegExp(/.*\..*\..*\..*/g);
    var matches = command_output_string.match(Re);
    var wanIpAddress;
    if (matches) {
        wanIpAddress = command_output_string;
    } else {
        wanIpAddress = '';
    }
    return wanIpAddress;
}

const LanIpAddressIndicator = new Lang.Class({
    Name: 'LanIpAddress.indicator',
    Extends: PanelMenu.Button,

    _init: function () {
        this.parent(0.0, "LAN IP Address Indicator", false);
        this.buttonText = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.actor.add_child(this.buttonText);
        this._updateLabel();
    },

    _updateLabel : function(){
        const refreshTime = 5 // in seconds

        if (this._timeout) {
                Mainloop.source_remove(this._timeout);
                this._timeout = null;
        }
        this._timeout = Mainloop.timeout_add_seconds(refreshTime, Lang.bind(this, this._updateLabel));
        // Show the right format. 0 = WAN, 4 = IPv4, 6=IPv6
        if (type===4) {
            this.buttonText.set_text("LAN: "+_get_lan_ip4());
        } else if (type===0) {
            this.buttonText.set_text("WAN: "+_get_wan_ip4());
        } else {
            this.buttonText.set_text("IP6: "+_get_lan_ip6());
        }
    },

    _removeTimeout: function () {
        if (this._timeout) {
            this._timeout = null;
        }
    },

    stop: function () {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
        }
        this._timeout = undefined;

        this.menu.removeAll();
    }
});

let _indicator;

function init() {
    log('LAN IP Address extension initialized');
}

function enable() {
    log('LAN IP Address extension enabled');
    _indicator = new LanIpAddressIndicator();
	Main.panel.addToStatusArea('lan-ip-address-indicator', _indicator);
    _indicator.connect('button-press-event', _toggle);
}

function disable() {
    log('LAN IP Address extension disabled');
    _indicator.stop();
    _indicator.destroy();
}

function _toggle() {
    if (type===4) {
        type=6;
    } else if (type===6) {
        type=0;
    } else {
        type=4;
    }
    _indicator._updateLabel();
}
