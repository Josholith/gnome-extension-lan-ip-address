import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Utils from './utils.js';


export class LanIPAddressIndicator extends PanelMenu.Button {
    _init() {
        // Chaining up to the super-class
        super._init(0, "LAN IP Address Indicator", false);

        this.buttonText = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.add_child(this.buttonText);
        this._updateLabel();
    }

    _updateLabel() {
        const priority = 0; // G_PRIORITY_DEFAULT
        const refreshTime = 5; // in seconds

        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = undefined;
        }
        this._timeout = GLib.timeout_add_seconds(priority, refreshTime, () => { this._updateLabel() });
        this.buttonText.set_text(Utils.getLanIp());
    }

    stop() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
        }
        this._timeout = undefined;
        this.menu.removeAll();
    }
}

