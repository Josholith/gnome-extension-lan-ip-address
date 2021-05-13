# gnome-extension-lan-ip-address

This is the code behind the GNOME Shell Extension called [**LAN IP Address**](https://extensions.gnome.org/extension/1762/lan-ip-address/), available in the GNOME Shell Extension store at https://extensions.gnome.org/extension/1762/lan-ip-address/

![icon showing 192.168.](icon.png)

## Impetus

I specifically made this extension because I couldn't find an extension in the store that met my needs.  Often I have multiple IP addresses on my Linux workstation, especially when using Docker, and this would seem to confuse any of the other similar extensions.  The only address I want to see in my top panel is my machine's true (i.e. routable) LAN IP address, the one you would use if you were to SSH to your machine on the LAN.

## Privacy
This extension also respects your privacy and bandwidth, as it makes absolutely zero requests to the Internet and sends zero packets to the Internet.  The plugin gets its information from your local routing table (from the output of `ip route`) and only displays the result in the GNOME panel, and this information never leaves your computer.

## How it works - in detail
To get this LAN IP address, internally this extension runs a shell command
```sh
ip route get 1.1.1.1
```
The `1.1.1.1` address is [Cloudflare DNS](https://blog.cloudflare.com/dns-resolver-1-1-1-1/), and the above command asks your routing table which interface and source address would be used to reach the gateway that would ultimately reach `1.1.1.1`.  There's nothing special about `1.1.1.1`. You could use any routable IP address.  I'm pretty sure doing `ip route` doesn't actually ping or communicate in any way with that address, it simply asks your system routing table how you *would* hypothetically reach that address *if* you wanted to send packets.

A sample output of the `ip` shell command would look something like this:
```
1.1.1.1 via 192.168.1.1 dev eth0 src 192.168.1.173
```
In the above example response, `192.168.1.1` would be your gateway and the source (src) address to reach that gateway is `192.168.1.173`, and it's this that I interpret as your routable LAN IP address.

Within the (Javascript) extension code, I am simply matching and splitting the string to get just that IP address.

## Scope
**What if you want to see your WAN IP address, too?**  This is out of scope for this simple extension. This extension by design only shows your internal LAN IP address, just as the name suggests. It is designed for developers and other engineers who only need to see their LAN address in a convenient place, and with total privacy (no calls to the Internet).  If you actually want your WAN IP address or IPv6 addresses, check out this extension instead: [All IP Addresses](https://extensions.gnome.org/extension/3994/all-ip-addresses/)

## Known limitations
* In the atypical case that you are working on a LAN not connected to the Internet (such as an isolated lab), you have no route that could reach `1.1.1.1`, so things will not work the way this extension is currently designed.
