import { panel } from 'resource:///org/gnome/shell/ui/main.js';
import { LanIPAddressIndicator } from './LanIPAddressIndicator.js';
import GObject from 'gi://GObject';


export default class LanIpAddressExtension {
    _indicator;

    enable() {
        this._indicator = new LanIPAddressIndicator();
        panel.addToStatusArea('lan-ip-address-indicator', this._indicator);
    }

    disable() {
        this._indicator.stop();
        this._indicator.destroy();
        this._indicator = undefined;
    }
}

GObject.registerClass(
    {GTypeName: 'LanIPAddressIndicator'},
    LanIPAddressIndicator
);

